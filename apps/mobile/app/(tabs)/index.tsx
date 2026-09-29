import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { api, API_BASE_URL } from "../../src/services/api";
import { Car as CarType, Location as LocationType } from "../../src/types";
import { Users, Fuel, Gauge, Sparkles, Search, MapPin } from "lucide-react-native";

export default function FleetBrowseScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<CarType[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLocations = useCallback(async () => {
    try {
      const res = await api.locations.getLocations();
      if (res.success && res.data) {
        setLocations(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    }
  }, []);

  const fetchCars = useCallback(async () => {
    try {
      const res = await api.fleet.getCars({
        location_id: selectedLocationId || undefined,
      });
      if (res.success && res.data) {
        setCars(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch fleet:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedLocationId]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    setIsLoading(true);
    fetchCars();
  }, [fetchCars]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCars();
  };

  const filteredCars = cars.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      (c.category?.name && c.category.name.toLowerCase().includes(q)) ||
      (c.location?.name && c.location.name.toLowerCase().includes(q)) ||
      (c.location?.city && c.location.city.toLowerCase().includes(q))
    );
  });

  const resolveImageUrl = (path: string) => {
    if (!path) return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${API_BASE_URL}${path}`;
  };

  const renderCarCard = ({ item }: { item: CarType }) => {
    const startingPlan = item.rental_plans && item.rental_plans.length > 0
      ? item.rental_plans[0]
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/car/${item.slug}` as any)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: resolveImageUrl(item.primary_image) }}
            style={styles.carImage}
            resizeMode="cover"
          />
          {item.badge && (
            <View style={styles.badge}>
              <Sparkles size={10} color="#000" style={{ marginRight: 3 }} />
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          {item.location && (
            <View style={styles.locationTag}>
              <MapPin size={10} color="#f59e0b" style={{ marginRight: 3 }} />
              <Text style={styles.locationTagText}>{item.location.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.brandText}>{item.brand.toUpperCase()}</Text>
              <Text style={styles.carName}>{item.name}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Starting Plan</Text>
              <Text style={styles.priceValue}>
                {startingPlan
                  ? `₹${Number(startingPlan.price).toLocaleString("en-IN")}`
                  : `₹${Number(item.price_per_day).toLocaleString("en-IN")}`}
              </Text>
              {startingPlan && (
                <Text style={styles.planSub}>{startingPlan.free_km} KM included</Text>
              )}
            </View>
          </View>

          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Users size={13} color="#a3a3a3" />
              <Text style={styles.specText}>{item.seats} Seats</Text>
            </View>
            <View style={styles.specItem}>
              <Gauge size={13} color="#a3a3a3" />
              <Text style={styles.specText}>{item.transmission}</Text>
            </View>
            <View style={styles.specItem}>
              <Fuel size={13} color="#a3a3a3" />
              <Text style={styles.specText}>{item.fuel_type}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => router.push(`/car/${item.slug}` as any)}
          >
            <Text style={styles.bookButtonText}>Choose Plan & Book</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={16} color="#737373" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Baleno, Glanza, Hatchback..."
          placeholderTextColor="#737373"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Location Filter Pills */}
      <View style={styles.locationScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.locationPillsList}
        >
          <TouchableOpacity
            style={[
              styles.locationPill,
              selectedLocationId === null && styles.locationPillActive,
            ]}
            onPress={() => setSelectedLocationId(null)}
          >
            <Text
              style={[
                styles.locationPillText,
                selectedLocationId === null && styles.locationPillTextActive,
              ]}
            >
              All Cities
            </Text>
          </TouchableOpacity>
          {locations.map((loc) => (
            <TouchableOpacity
              key={loc.id}
              style={[
                styles.locationPill,
                selectedLocationId === loc.id && styles.locationPillActive,
              ]}
              onPress={() => setSelectedLocationId(loc.id)}
            >
              <MapPin
                size={11}
                color={selectedLocationId === loc.id ? "#000" : "#a3a3a3"}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.locationPillText,
                  selectedLocationId === loc.id && styles.locationPillTextActive,
                ]}
              >
                {loc.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Fetching Fleet...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCars}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCarCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#f59e0b"
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No vehicles match your search.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#222",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
  },
  locationScrollContainer: {
    marginBottom: 4,
  },
  locationPillsList: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#282828",
  },
  locationPillActive: {
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
  },
  locationPillText: {
    color: "#a3a3a3",
    fontSize: 12,
    fontWeight: "600",
  },
  locationPillTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    color: "#a3a3a3",
    fontSize: 12,
    marginTop: 10,
  },
  emptyText: {
    color: "#737373",
    fontSize: 13,
  },
  card: {
    backgroundColor: "#121212",
    borderRadius: 22,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  imageContainer: {
    height: 180,
    width: "100%",
    backgroundColor: "#1a1a1a",
    position: "relative",
  },
  carImage: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  locationTag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
    flexDirection: "row",
    alignItems: "center",
  },
  locationTagText: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "700",
  },
  cardContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  brandText: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 2,
  },
  carName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    maxWidth: 190,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    color: "#737373",
    fontSize: 9,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  priceValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  planSub: {
    color: "#a3a3a3",
    fontSize: 9,
    marginTop: 1,
  },
  specsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#1f1f1f",
    marginBottom: 14,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  specText: {
    color: "#a3a3a3",
    fontSize: 11,
    fontWeight: "500",
  },
  bookButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
  },
});
