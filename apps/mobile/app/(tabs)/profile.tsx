import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";
import { User, Phone, Mail, ShieldCheck, LogOut, ChevronRight, Key, CreditCard, FileText, Receipt } from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/(tabs)" as any);
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.centerContainer}>
        <User size={48} color="#555" style={{ marginBottom: 12 }} />
        <Text style={styles.title}>Guest Profile</Text>
        <Text style={styles.subTitle}>Sign in to manage your bookings, verified credentials, and security settings.</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/account/login" as any)}
        >
          <Text style={styles.primaryBtnText}>Sign In / Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.fullName?.charAt(0) || "U"}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.fullName}</Text>
          <View style={styles.verifiedBadge}>
            <ShieldCheck size={12} color="#10b981" />
            <Text style={styles.verifiedText}>Verified Prime Member</Text>
          </View>
        </View>
      </View>

      {/* Account Quick Navigations */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => router.push("/account/payments" as any)}
        >
          <View style={[styles.menuIconWrap, { backgroundColor: "#1e1b13" }]}>
            <CreditCard size={18} color="#f59e0b" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Payments &amp; Ledger</Text>
            <Text style={styles.menuSub}>Invoices, deposits, and settlement history</Text>
          </View>
          <ChevronRight size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuRow, { borderTopWidth: 1, borderTopColor: "#1f1f1f" }]}
          onPress={() => router.push("/account/documents" as any)}
        >
          <View style={[styles.menuIconWrap, { backgroundColor: "#131e18" }]}>
            <FileText size={18} color="#10b981" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Identity Documents &amp; KYC</Text>
            <Text style={styles.menuSub}>Driving License, Aadhaar, and verification gate</Text>
          </View>
          <ChevronRight size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuRow, { borderTopWidth: 1, borderTopColor: "#1f1f1f" }]}
          onPress={() => router.push("/(tabs)/bookings" as any)}
        >
          <View style={[styles.menuIconWrap, { backgroundColor: "#171a24" }]}>
            <Receipt size={18} color="#3b82f6" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>My Reservations</Text>
            <Text style={styles.menuSub}>Active trips, vouchers, and vehicle status</Text>
          </View>
          <ChevronRight size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Profile Details */}
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Phone size={16} color="#f59e0b" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
        </View>

        {user.email && (
          <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: "#1f1f1f" }]}>
            <Mail size={16} color="#f59e0b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={16} color="#ef4444" style={{ marginRight: 8 }} />
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    padding: 18,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080808",
    padding: 24,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  subTitle: {
    color: "#737373",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    maxWidth: 260,
  },
  primaryBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "800",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  verifiedText: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#121212",
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  menuSub: {
    color: "#737373",
    fontSize: 10,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  infoContent: {
    marginLeft: 12,
  },
  infoLabel: {
    color: "#737373",
    fontSize: 10,
    textTransform: "uppercase",
  },
  infoValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    paddingVertical: 14,
    borderRadius: 14,
  },
  logoutBtnText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "700",
  },
});
