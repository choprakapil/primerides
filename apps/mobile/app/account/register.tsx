import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";
import { Lock, Phone, User, Mail, ArrowRight } from "lucide-react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!fullName.trim() || !phone.trim() || !password) {
      Alert.alert("Required", "Full name, mobile number, and password are required.");
      return;
    }

    const success = await register(
      fullName.trim(),
      phone.trim(),
      password,
      email.trim() || undefined
    );

    if (success) {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brandSubtitle}>PRIMERIDES LUXURY</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register to reserve exotic self-drive & chauffeur driven vehicles.</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User size={16} color="#737373" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Kapil Chopra"
                placeholderTextColor="#666"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Phone size={16} color="#737373" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+91 98112 23344"
                placeholderTextColor="#666"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Mail size={16} color="#737373" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="client@primerides.in"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Create Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={16} color="#737373" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.submitBtnText}>Create Account</Text>
                <ArrowRight size={16} color="#000" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/account/login" as any)}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 20,
  },
  brandSubtitle: {
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "#888",
    fontSize: 13,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 12,
    fontWeight: "600",
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 5,
  },
  label: {
    color: "#a3a3a3",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 12,
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  submitBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  footerText: {
    color: "#737373",
    fontSize: 12,
  },
  loginLink: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "700",
  },
});
