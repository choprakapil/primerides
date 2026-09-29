import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
  Switch,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api, API_BASE_URL } from "../../src/services/api";
import { useAuthStore } from "../../src/stores/authStore";
import { Car, RentalPlan } from "../../src/types";
import {
  Users,
  Fuel,
  Gauge,
  ShieldCheck,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Zap,
} from "lucide-react-native";

export default function CarDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [car, setCar] = useState<Car | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessCode, setBookingSuccessCode] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Booking Form State
  const [withChauffeur, setWithChauffeur] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    api.fleet.getCarBySlug(slug).then((res) => {
      if (res.success && res.data) {
        setCar(res.data);
        if (res.data.rental_plans && res.data.rental_plans.length > 0) {
          setSelectedPlanId(res.data.rental_plans[0].id);
        }
        if (res.data.location) {
          setPickupLocation(`${res.data.location.name} Pickup Point`);
          setDropLocation(`${res.data.location.name} Drop Point`);
        }
      }
      setIsLoading(false);
    });
  }, [slug]);

  const selectedPlan: RentalPlan | undefined = useMemo(() => {
    if (!car || !car.rental_plans) return undefined;
    return car.rental_plans.find((p) => p.id === selectedPlanId) || car.rental_plans[0];
  }, [car, selectedPlanId]);

  // Dynamic Date calculation based on selected plan duration
  const { startDate, endDate, startFormatted, endFormatted } = useMemo(() => {
    const durationDays = selectedPlan ? selectedPlan.duration_days : 1;
    const start = new Date(Date.now() + 86400000 * 2); // 2 days ahead
    const end = new Date(start.getTime() + 86400000 * durationDays);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      startFormatted: start.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      endFormatted: end.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    };
  }, [selectedPlan]);

  // Live Display-Only Price Estimate (Server recalculates authoritatively)
  const priceEstimate = useMemo(() => {
    if (!selectedPlan) return { base: 0, chauffeur: 0, deposit: 0, total: 0 };
    const base = Number(selectedPlan.price);
    const durationDays = selectedPlan.duration_days || 1;
    const chauffeur = withChauffeur ? 1500 * durationDays : 0;
    const deposit = Number(selectedPlan.security_deposit || 5000);
    const total = base + chauffeur + deposit;
    return { base, chauffeur, deposit, total };
  }, [selectedPlan, withChauffeur]);

  const handleBookingSubmit = async () => {
    setConflictError(null);

    // 1. Auth Guard
    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "Please sign in or create an account to reserve this vehicle.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/account/login" as any) },
        ]
      );
      return;
    }

    if (!car || !selectedPlan) return;

    setIsSubmitting(true);
    try {
      const res = await api.bookings.createBooking({
        carId: car.id,
        rentalPlanId: selectedPlan.id,
        locationId: car.location_id || undefined,
        startDate,
        endDate,
        pickupLocation: pickupLocation || car.location?.name || "Pickup Location",
        dropLocation: dropLocation || car.location?.name || "Pickup Location",
        withChauffeur,
      });

      if (res.success && res.data) {
        setBookingSuccessCode(res.data.booking_code);
      } else {
        const errorMsg = res.error || "Reservation request could not be completed.";
        if (errorMsg.toLowerCase().includes("conflict") || errorMsg.toLowerCase().includes("already reserved")) {
          setConflictError(errorMsg);
        } else {
          Alert.alert("Booking Error", errorMsg);
        }
      }
    } catch (err: any) {
      Alert.alert("Submission Error", err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolveImageUrl = (path?: string) => {
    if (!path) return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${API_BASE_URL}${path}`;
  };

  if (isLoading || !car) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading vehicle specifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Vehicle Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: resolveImageUrl(car.primary_image) }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        {car.badge && (
          <View style={styles.badge}>
            <Sparkles size={11} color="#000" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>{car.badge}</Text>
          </View>
        )}
        {car.location && (
          <View style={styles.locationTag}>
            <MapPin size={11} color="#f59e0b" style={{ marginRight: 4 }} />
            <Text style={styles.locationTagText}>{car.location.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Title & Brand */}
        <View style={styles.header}>
          <Text style={styles.brandText}>{car.brand.toUpperCase()}</Text>
          <Text style={styles.titleText}>{car.name}</Text>
          {car.location && (
            <View style={styles.cityLocationRow}>
              <MapPin size={12} color="#a3a3a3" />
              <Text style={styles.cityLocationText}>
                Location: {car.location.name} ({car.location.city})
              </Text>
            </View>
          )}
        </View>

        {/* Specs Grid */}
        <View style={styles.specsGrid}>
          <View style={styles.specBox}>
            <Users size={16} color="#f59e0b" />
            <Text style={styles.specValue}>{car.seats} Pax</Text>
            <Text style={styles.specLabel}>Seating</Text>
          </View>
          <View style={styles.specBox}>
            <Gauge size={16} color="#f59e0b" />
            <Text style={styles.specValue}>{car.transmission}</Text>
            <Text style={styles.specLabel}>Gearbox</Text>
          </View>
          <View style={styles.specBox}>
            <Fuel size={16} color="#f59e0b" />
            <Text style={styles.specValue}>{car.fuel_type}</Text>
            <Text style={styles.specLabel}>Fuel</Text>
          </View>
          <View style={styles.specBox}>
            <ShieldCheck size={16} color="#f59e0b" />
            <Text style={styles.specValue}>
              ₹{Number(selectedPlan?.security_deposit || 5000).toLocaleString("en-IN")}
            </Text>
            <Text style={styles.specLabel}>Deposit</Text>
          </View>
        </View>

        {/* Success Confirmation Card */}
        {bookingSuccessCode ? (
          <View style={styles.successCard}>
            <CheckCircle size={36} color="#10b981" style={{ marginBottom: 8 }} />
            <Text style={styles.successTitle}>Reservation Confirmed!</Text>
            <Text style={styles.successSub}>
              Booking reference: <Text style={styles.codeHighlight}>{bookingSuccessCode}</Text>
            </Text>
            <TouchableOpacity
              style={styles.viewBookingsBtn}
              onPress={() => router.replace("/(tabs)/bookings" as any)}
            >
              <Text style={styles.viewBookingsBtnText}>View in My Rides</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Interactive Booking Form */
          <View style={styles.bookingCard}>
            <Text style={styles.bookingCardTitle}>Choose Kilometer / Rental Plan</Text>

            {/* Conflict Banner */}
            {conflictError && (
              <View style={styles.conflictBanner}>
                <AlertTriangle size={16} color="#ef4444" style={{ marginRight: 6 }} />
                <Text style={styles.conflictText}>{conflictError}</Text>
              </View>
            )}

            {/* Rental Plan Selection Cards */}
            <View style={styles.plansContainer}>
              {car.rental_plans?.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planOptionCard,
                      isSelected && styles.planOptionCardActive,
                    ]}
                    onPress={() => setSelectedPlanId(plan.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.planHeaderRow}>
                      <View style={styles.planNameBox}>
                        <Zap
                          size={13}
                          color={isSelected ? "#000" : "#f59e0b"}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.planNameText,
                            isSelected && styles.planNameTextActive,
                          ]}
                        >
                          {plan.name}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.planPriceText,
                          isSelected && styles.planPriceTextActive,
                        ]}
                      >
                        ₹{Number(plan.price).toLocaleString("en-IN")}
                      </Text>
                    </View>
                    <View style={styles.planMetaRow}>
                      <Text
                        style={[
                          styles.planMetaText,
                          isSelected && styles.planMetaTextActive,
                        ]}
                      >
                        {plan.free_km.toLocaleString("en-IN")} Free KM • ₹{Number(plan.extra_km_rate)}/extra km
                      </Text>
                      <Text
                        style={[
                          styles.planDurationText,
                          isSelected && styles.planDurationTextActive,
                        ]}
                      >
                        {plan.duration_days} {plan.duration_days === 1 ? "day" : "days"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Plan Dates Summary */}
            <View style={styles.datesSummaryCard}>
              <Calendar size={14} color="#f59e0b" style={{ marginRight: 8 }} />
              <Text style={styles.datesSummaryText}>
                Reservation Dates: <Text style={{ color: "#fff", fontWeight: "700" }}>{startFormatted} – {endFormatted}</Text>
              </Text>
            </View>

            {/* Chauffeur Toggle */}
            <View style={[styles.formRow, { borderBottomWidth: 0, paddingBottom: 4 }]}>
              <View>
                <Text style={styles.formLabel}>Professional Chauffeur</Text>
                <Text style={styles.formSub}>
                  Uniformed driver (+₹1,500/day = ₹{1500 * (selectedPlan?.duration_days || 1)})
                </Text>
              </View>
              <Switch
                value={withChauffeur}
                onValueChange={setWithChauffeur}
                trackColor={{ false: "#333", true: "#f59e0b" }}
                thumbColor={withChauffeur ? "#000" : "#888"}
              />
            </View>

            {/* Pickup & Drop inputs */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pickup Location</Text>
              <TextInput
                style={styles.textInput}
                value={pickupLocation}
                onChangeText={setPickupLocation}
                placeholder="Enter pickup address or hub"
                placeholderTextColor="#737373"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Drop Location</Text>
              <TextInput
                style={styles.textInput}
                value={dropLocation}
                onChangeText={setDropLocation}
                placeholder="Enter drop address or hub"
                placeholderTextColor="#737373"
              />
            </View>

            {/* Live Price Breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownText}>
                  {selectedPlan?.name || "Rental Plan"} ({selectedPlan?.free_km} KM)
                </Text>
                <Text style={styles.breakdownVal}>₹{priceEstimate.base.toLocaleString("en-IN")}</Text>
              </View>
              {withChauffeur && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownText}>Chauffeur Fee ({selectedPlan?.duration_days} days)</Text>
                  <Text style={styles.breakdownVal}>₹{priceEstimate.chauffeur.toLocaleString("en-IN")}</Text>
                </View>
              )}
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownText}>Refundable Security Deposit</Text>
                <Text style={styles.breakdownVal}>₹{priceEstimate.deposit.toLocaleString("en-IN")}</Text>
              </View>
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Payable Total</Text>
                <Text style={styles.totalVal}>₹{priceEstimate.total.toLocaleString("en-IN")}</Text>
              </View>
            </View>

            {/* Submit Reservation */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
              onPress={handleBookingSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isAuthenticated ? "Confirm & Reserve Vehicle" : "Sign In to Book"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080808",
    padding: 20,
  },
  loadingText: {
    color: "#a3a3a3",
    fontSize: 12,
    marginTop: 12,
  },
  imageContainer: {
    height: 240,
    width: "100%",
    backgroundColor: "#121212",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  locationTag: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
    flexDirection: "row",
    alignItems: "center",
  },
  locationTagText: {
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: "700",
  },
  content: {
    padding: 18,
  },
  header: {
    marginBottom: 16,
  },
  brandText: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  titleText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  cityLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  cityLocationText: {
    color: "#a3a3a3",
    fontSize: 12,
  },
  specsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  specBox: {
    flex: 1,
    backgroundColor: "#121212",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  specValue: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },
  specLabel: {
    color: "#737373",
    fontSize: 9,
    marginTop: 2,
  },
  bookingCard: {
    backgroundColor: "#121212",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 40,
  },
  bookingCardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  plansContainer: {
    gap: 8,
    marginBottom: 14,
  },
  planOptionCard: {
    backgroundColor: "#181818",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#282828",
  },
  planOptionCardActive: {
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
  },
  planHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  planNameBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  planNameText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  planNameTextActive: {
    color: "#000",
  },
  planPriceText: {
    color: "#f59e0b",
    fontSize: 14,
    fontWeight: "800",
  },
  planPriceTextActive: {
    color: "#000",
  },
  planMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planMetaText: {
    color: "#a3a3a3",
    fontSize: 11,
  },
  planMetaTextActive: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  planDurationText: {
    color: "#737373",
    fontSize: 10,
    fontWeight: "600",
  },
  planDurationTextActive: {
    color: "#222",
  },
  datesSummaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171717",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#282828",
    marginBottom: 12,
  },
  datesSummaryText: {
    color: "#a3a3a3",
    fontSize: 11,
  },
  conflictBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  conflictText: {
    color: "#fca5a5",
    fontSize: 12,
    flex: 1,
    fontWeight: "600",
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
    marginBottom: 10,
  },
  formLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  formSub: {
    color: "#737373",
    fontSize: 10,
    marginTop: 2,
  },
  inputGroup: {
    marginTop: 10,
  },
  inputLabel: {
    color: "#a3a3a3",
    fontSize: 11,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: "#181818",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 12,
    borderWidth: 1,
    borderColor: "#262626",
  },
  breakdownCard: {
    backgroundColor: "#161616",
    padding: 14,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  breakdownText: {
    color: "#888",
    fontSize: 11,
  },
  breakdownVal: {
    color: "#ccc",
    fontSize: 11,
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#262626",
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  totalVal: {
    color: "#f59e0b",
    fontSize: 16,
    fontWeight: "800",
  },
  submitButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "800",
  },
  successCard: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 40,
  },
  successTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  successSub: {
    color: "#a3a3a3",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  codeHighlight: {
    color: "#f59e0b",
    fontWeight: "800",
    fontFamily: "monospace",
  },
  viewBookingsBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  viewBookingsBtnText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
  },
});
