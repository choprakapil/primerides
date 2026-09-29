import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../src/services/api";
import { useAuthStore } from "../../src/stores/authStore";
import { PaymentRecord, UnpaidBookingRecord, PaymentLedgerData } from "../../src/types";
import {
  CreditCard,
  Receipt,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Banknote,
  Sparkles,
  RefreshCw,
  X,
  Lock,
} from "lucide-react-native";

export default function MobilePaymentsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<PaymentLedgerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Payment Modal State
  const [selectedBooking, setSelectedBooking] = useState<UnpaidBookingRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"gateway" | "upi" | "handover_cod">("gateway");
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await api.payments.getMyPayments();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load payment ledger:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/account/login" as any);
      return;
    }
    fetchPayments();
  }, [isAuthenticated]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPayments();
  };

  const handleExecutePayment = async () => {
    if (!selectedBooking) return;

    if (paymentMethod === "upi" && !utrNumber.trim()) {
      Alert.alert("UTR Number Required", "Please enter your 12-digit UPI reference number after transferring.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.payments.submitPayment({
        bookingId: selectedBooking.id,
        paymentMethod,
        transactionRef: paymentMethod === "upi" ? utrNumber.trim() : undefined,
        amount: Number(selectedBooking.total_amount),
        notes: `Mobile App Payment via ${paymentMethod.toUpperCase()}`,
      });

      if (res.success) {
        Alert.alert(
          "Payment Recorded",
          paymentMethod === "handover_cod"
            ? "Curbside collection scheduled! Please have cash or card ready at vehicle delivery."
            : "Payment captured successfully! Your luxury rental reservation is confirmed.",
          [{ text: "OK", onPress: () => setSelectedBooking(null) }]
        );
        fetchPayments();
      } else {
        Alert.alert("Payment Failed", res.error || "Unable to complete transaction.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading Transaction Ledger...</Text>
      </View>
    );
  }

  const payments = data?.payments || [];
  const unpaidBookings = data?.unpaidBookings || [];
  const stats = data?.stats || {
    totalCaptured: 0,
    totalAuthorized: 0,
    totalRefunded: 0,
    totalTransactions: 0,
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Payments &amp; Ledger</Text>
          <Text style={styles.headerSubtitle}>Verified Rental Transactions &amp; Deposits</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#f59e0b" />}
      >
        {/* Metric Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Settled</Text>
              <CreditCard size={14} color="#10b981" />
            </View>
            <Text style={styles.statValue}>₹{stats.totalCaptured.toLocaleString("en-IN")}</Text>
            <Text style={styles.statSub}>Captured Rentals</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Holds</Text>
              <Clock size={14} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>₹{stats.totalAuthorized.toLocaleString("en-IN")}</Text>
            <Text style={styles.statSub}>Security Deposits</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Refunds</Text>
              <ShieldCheck size={14} color="#a855f7" />
            </View>
            <Text style={styles.statValue}>₹{stats.totalRefunded.toLocaleString("en-IN")}</Text>
            <Text style={styles.statSub}>Released to Source</Text>
          </View>
        </View>

        {/* Actionable Unpaid Reservations */}
        {unpaidBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={16} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Pending Clearance ({unpaidBookings.length})</Text>
            </View>
            <Text style={styles.sectionDesc}>
              Complete advance rental payment or confirm curbside collection before vehicle handover.
            </Text>

            {unpaidBookings.map((b) => (
              <View key={b.id} style={styles.unpaidCard}>
                <View style={styles.unpaidTop}>
                  <View>
                    <Text style={styles.carName}>{b.car_name || b.car?.name || "Luxury Vehicle"}</Text>
                    <Text style={styles.bookingCode}>Ref: #{b.booking_code}</Text>
                  </View>
                  <View style={styles.amountBadge}>
                    <Text style={styles.amountText}>₹{Number(b.total_amount).toLocaleString("en-IN")}</Text>
                  </View>
                </View>

                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>
                    {new Date(b.start_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} —{" "}
                    {new Date(b.end_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </Text>
                  <Text style={styles.planName}>{b.rental_plan?.name || "KM Plan"}</Text>
                </View>

                <TouchableOpacity
                  style={styles.payNowBtn}
                  onPress={() => {
                    setSelectedBooking(b);
                    setUtrNumber("");
                  }}
                >
                  <CreditCard size={15} color="#000" />
                  <Text style={styles.payNowBtnText}>Select Payment Method</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Transaction History Ledger */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Receipt size={16} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Transaction History ({payments.length})</Text>
          </View>

          {payments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Receipt size={36} color="#444" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyTitle}>No Transactions Recorded</Text>
              <Text style={styles.emptySubtitle}>
                Your payment confirmations and security deposit refunds will be chronologically logged here.
              </Text>
            </View>
          ) : (
            payments.map((p) => {
              const isCaptured = p.status === "captured";
              const isRefunded = p.status === "refunded";

              return (
                <View key={p.id} style={styles.paymentCard}>
                  <View style={styles.paymentRow}>
                    <View style={styles.paymentIconWrap}>
                      {p.payment_method === "upi" ? (
                        <QrCode size={16} color="#f59e0b" />
                      ) : p.payment_method === "handover_cod" ? (
                        <Banknote size={16} color="#10b981" />
                      ) : (
                        <CreditCard size={16} color="#3b82f6" />
                      )}
                    </View>

                    <View style={styles.paymentDetails}>
                      <Text style={styles.paymentCar}>
                        {p.booking?.car?.name || p.booking?.car_name || "Rental Package"}
                      </Text>
                      <Text style={styles.paymentMeta}>
                        Ref: #{p.transaction_ref || p.gateway_payment_id || `PAY_${p.id}`} •{" "}
                        {new Date(p.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>

                    <View style={styles.paymentAmountCol}>
                      <Text style={[styles.paymentAmount, isRefunded && { color: "#a855f7" }]}>
                        {isRefunded ? "+" : ""}₹{Number(p.amount).toLocaleString("en-IN")}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          isCaptured && styles.badgeSuccess,
                          isRefunded && styles.badgePurple,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isCaptured && styles.badgeSuccessText,
                            isRefunded && styles.badgePurpleText,
                          ]}
                        >
                          {p.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Security & Refund Assurance Footer */}
        <View style={styles.securityBox}>
          <ShieldCheck size={18} color="#10b981" />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>100% Refundable Security Deposits</Text>
            <Text style={styles.securityText}>
              Security deposits are automatically returned to your original payment method within 48 hours of vehicle check-in.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Checkout Modal Sheet */}
      <Modal visible={!!selectedBooking} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Settle Vehicle Rental</Text>
                <Text style={styles.modalSub}>
                  Booking #{selectedBooking?.booking_code} • ₹
                  {Number(selectedBooking?.total_amount || 0).toLocaleString("en-IN")}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                <X size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Payment Method Selector */}
            <View style={styles.methodsContainer}>
              <TouchableOpacity
                style={[styles.methodOption, paymentMethod === "gateway" && styles.methodOptionActive]}
                onPress={() => setPaymentMethod("gateway")}
              >
                <CreditCard size={18} color={paymentMethod === "gateway" ? "#f59e0b" : "#888"} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodLabel}>Online Gateway (Card / Netbanking)</Text>
                  <Text style={styles.methodHint}>Instant capture &amp; booking confirmation</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodOption, paymentMethod === "upi" && styles.methodOptionActive]}
                onPress={() => setPaymentMethod("upi")}
              >
                <QrCode size={18} color={paymentMethod === "upi" ? "#f59e0b" : "#888"} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodLabel}>UPI Transfer / QR Code</Text>
                  <Text style={styles.methodHint}>GPay / PhonePe / Paytm to primerides@icici</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodOption, paymentMethod === "handover_cod" && styles.methodOptionActive]}
                onPress={() => setPaymentMethod("handover_cod")}
              >
                <Banknote size={18} color={paymentMethod === "handover_cod" ? "#f59e0b" : "#888"} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodLabel}>Curbside Handover (COD / POS)</Text>
                  <Text style={styles.methodHint}>Pay concierge at car key delivery</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* UPI UTR Input */}
            {paymentMethod === "upi" && (
              <View style={styles.upiInputWrap}>
                <Text style={styles.inputLabel}>Enter 12-Digit Bank UTR / Reference No. *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 405912839201"
                  placeholderTextColor="#666"
                  value={utrNumber}
                  onChangeText={setUtrNumber}
                  keyboardType="numeric"
                />
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.confirmBtn, isSubmitting && { opacity: 0.6 }]}
              onPress={handleExecutePayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Lock size={16} color="#000" />
                  <Text style={styles.confirmBtnText}>
                    {paymentMethod === "handover_cod"
                      ? "Confirm Curbside Collection"
                      : `Pay ₹${Number(selectedBooking?.total_amount || 0).toLocaleString("en-IN")}`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    padding: 24,
  },
  loadingText: {
    color: "#a3a3a3",
    fontSize: 13,
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
    backgroundColor: "#080808",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#737373",
    fontSize: 11,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#121212",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statLabel: {
    color: "#737373",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  statSub: {
    color: "#525252",
    fontSize: 9,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  sectionDesc: {
    color: "#737373",
    fontSize: 11,
    marginBottom: 12,
  },
  unpaidCard: {
    backgroundColor: "#161616",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#262626",
    marginBottom: 10,
  },
  unpaidTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  carName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  bookingCode: {
    color: "#737373",
    fontSize: 11,
    marginTop: 2,
    fontFamily: "monospace",
  },
  amountBadge: {
    backgroundColor: "#221c08",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f59e0b55",
  },
  amountText: {
    color: "#f59e0b",
    fontSize: 13,
    fontWeight: "800",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingTop: 8,
    marginBottom: 12,
  },
  dateText: {
    color: "#a3a3a3",
    fontSize: 11,
  },
  planName: {
    color: "#737373",
    fontSize: 11,
  },
  payNowBtn: {
    backgroundColor: "#f59e0b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  payNowBtnText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1c1c1c",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "#737373",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 240,
  },
  paymentCard: {
    backgroundColor: "#121212",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paymentIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#1c1c1c",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentDetails: {
    flex: 1,
  },
  paymentCar: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  paymentMeta: {
    color: "#666",
    fontSize: 10,
    marginTop: 2,
  },
  paymentAmountCol: {
    alignItems: "flex-end",
  },
  paymentAmount: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  statusBadge: {
    backgroundColor: "#222",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
  },
  statusBadgeText: {
    color: "#888",
    fontSize: 9,
    fontWeight: "800",
  },
  badgeSuccess: {
    backgroundColor: "#064e3b",
  },
  badgeSuccessText: {
    color: "#34d399",
  },
  badgePurple: {
    backgroundColor: "#3b0764",
  },
  badgePurpleText: {
    color: "#c084fc",
  },
  securityBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#0d1f14",
    borderWidth: 1,
    borderColor: "#14532d",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  securityTitle: {
    color: "#34d399",
    fontSize: 12,
    fontWeight: "800",
  },
  securityText: {
    color: "#a7f3d0",
    fontSize: 10,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#262626",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  modalSub: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  methodsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  methodOptionActive: {
    borderColor: "#f59e0b",
    backgroundColor: "#241e12",
  },
  methodLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  methodHint: {
    color: "#737373",
    fontSize: 10,
    marginTop: 1,
  },
  upiInputWrap: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#a3a3a3",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#1c1c1c",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#333",
  },
  confirmBtn: {
    backgroundColor: "#f59e0b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  confirmBtnText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "800",
  },
});
