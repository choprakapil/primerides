import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../src/services/api";
import { useAuthStore } from "../../src/stores/authStore";
import { Booking } from "../../src/types";
import { CalendarCheck, Shield, Clock, ArrowRight } from "lucide-react-native";

export default function BookingsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.bookings.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" };
      case "active":
        return { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" };
      case "completed":
        return { bg: "rgba(168, 85, 247, 0.15)", text: "#c084fc", border: "rgba(168, 85, 247, 0.3)" };
      case "cancelled":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" };
      default:
        return { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" };
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <CalendarCheck size={48} color="#555" style={{ marginBottom: 12 }} />
        <Text style={styles.guestTitle}>Sign in to view your rides</Text>
        <Text style={styles.guestSub}>Access your upcoming itineraries, driver details, and receipts.</Text>
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => router.push("/account/login" as any)}
        >
          <Text style={styles.signInBtnText}>Sign In / Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const statusStyle = getStatusColor(item.status);
    const startDate = new Date(item.start_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const endDate = new Date(item.end_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.bookingCode}>{item.booking_code}</Text>
            <Text style={styles.carName}>{item.car_name || item.car?.name || "Luxury Ride"}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Clock size={13} color="#888" />
            <Text style={styles.detailText}>{startDate} – {endDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Shield size={13} color="#888" />
            <Text style={styles.detailText}>{item.with_chauffeur ? "Chauffeur Service Included" : "Self-Drive Rental"}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>₹{Number(item.total_amount || 0).toLocaleString("en-IN")}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Fetching reservation history...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBookingCard}
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
              <CalendarCheck size={40} color="#444" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyTitle}>No Active Bookings</Text>
              <Text style={styles.emptySub}>Your upcoming and completed luxury reservations will appear here.</Text>
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
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: "#a3a3a3",
    fontSize: 12,
    marginTop: 10,
  },
  guestTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  guestSub: {
    color: "#737373",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    maxWidth: 260,
  },
  signInBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  signInBtnText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  emptySub: {
    color: "#737373",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 240,
  },
  bookingCard: {
    backgroundColor: "#121212",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingCode: {
    color: "#f59e0b",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  carName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  cardDetails: {
    backgroundColor: "#171717",
    padding: 12,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    color: "#a3a3a3",
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    color: "#737373",
    fontSize: 10,
    textTransform: "uppercase",
  },
  amountValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
