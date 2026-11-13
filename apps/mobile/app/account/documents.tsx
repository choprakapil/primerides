import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../src/services/api";
import { useAuthStore } from "../../src/stores/authStore";
import { IdentityDocument } from "../../src/types";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  Upload,
} from "lucide-react-native";

const SLOTS = [
  {
    type: "driving_license_front",
    title: "Driving License (Front)",
    desc: "Photo with license number, name, and validity",
  },
  {
    type: "driving_license_back",
    title: "Driving License (Back)",
    desc: "Photo showing authorized vehicle classes",
  },
  {
    type: "aadhaar",
    title: "Aadhaar Card / Passport",
    desc: "Secondary government identity proof",
  },
];

export default function MobileDocumentsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [documents, setDocuments] = useState<IdentityDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const res = await api.documents.getMyDocuments();
      if (res.success && res.data) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/account/login" as any);
      return;
    }
    fetchDocs();
  }, [isAuthenticated]);

  const handlePickAndUpload = async (slotType: string, source: "camera" | "library") => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Camera permission is required to capture your document photo."
          );
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          base64: true,
          quality: 0.8,
          allowsEditing: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Photo library permission is required to select your document photo."
          );
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          base64: true,
          quality: 0.8,
          allowsEditing: true,
        });
      }

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert("Error", "Could not process image data. Please try again.");
        return;
      }

      setUploadingSlot(slotType);

      const mimeType = asset.mimeType || "image/jpeg";
      const fileName = asset.fileName || `${slotType}.jpg`;
      const fileBase64 = `data:${mimeType};base64,${asset.base64}`;

      const uploadRes = await api.documents.uploadDocument({
        type: slotType,
        fileBase64,
        fileName,
        mimeType,
      });

      if (uploadRes.success) {
        Alert.alert("Success", "Document uploaded successfully and submitted for review.");
        await fetchDocs();
      } else {
        Alert.alert("Upload Failed", uploadRes.message || "Failed to upload document.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Upload Failed", err.message || "An unexpected error occurred.");
    } finally {
      setUploadingSlot(null);
    }
  };

  const promptUploadOptions = (slotType: string, slotTitle: string) => {
    Alert.alert(
      `Upload ${slotTitle}`,
      "Choose a source to upload your identity document photo:",
      [
        {
          text: "Take Photo",
          onPress: () => handlePickAndUpload(slotType, "camera"),
        },
        {
          text: "Choose from Library",
          onPress: () => handlePickAndUpload(slotType, "library"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const getDoc = (type: string) => documents.find((d) => d.type === type);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC & Identity Verification</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoTitleRow}>
          <ShieldCheck size={18} color="#f59e0b" />
          <Text style={styles.infoTitle}>Vehicle Handover Policy</Text>
        </View>
        <Text style={styles.infoText}>
          A verified Driving License is required before vehicle handover. Bookings can be created immediately, but trip activation requires verified documents.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading verification status...</Text>
        </View>
      ) : (
        <View style={styles.slotsContainer}>
          {SLOTS.map((slot) => {
            const doc = getDoc(slot.type);
            const isUploadingThis = uploadingSlot === slot.type;
            return (
              <View key={slot.type} style={styles.slotCard}>
                <View style={styles.slotHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.slotTitle}>{slot.title}</Text>
                    <Text style={styles.slotDesc}>{slot.desc}</Text>
                  </View>
                  {doc?.status === "verified" && (
                    <View style={styles.badgeVerified}>
                      <CheckCircle2 size={12} color="#10b981" style={{ marginRight: 4 }} />
                      <Text style={styles.badgeVerifiedText}>Verified</Text>
                    </View>
                  )}
                  {doc?.status === "pending" && (
                    <View style={styles.badgePending}>
                      <Clock size={12} color="#f59e0b" style={{ marginRight: 4 }} />
                      <Text style={styles.badgePendingText}>Under Review</Text>
                    </View>
                  )}
                  {doc?.status === "rejected" && (
                    <View style={styles.badgeRejected}>
                      <AlertTriangle size={12} color="#ef4444" style={{ marginRight: 4 }} />
                      <Text style={styles.badgeRejectedText}>Rejected</Text>
                    </View>
                  )}
                  {!doc && (
                    <View style={styles.badgeUnset}>
                      <Text style={styles.badgeUnsetText}>Pending Upload</Text>
                    </View>
                  )}
                </View>

                {doc?.status === "rejected" && doc.rejection_reason && (
                  <View style={styles.rejectionBox}>
                    <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
                    <Text style={styles.rejectionText}>{doc.rejection_reason}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.uploadBtn,
                    isUploadingThis && { opacity: 0.7 },
                  ]}
                  disabled={uploadingSlot !== null}
                  onPress={() => promptUploadOptions(slot.type, slot.title)}
                >
                  {isUploadingThis ? (
                    <>
                      <ActivityIndicator size="small" color="#000" style={{ marginRight: 6 }} />
                      <Text style={styles.uploadBtnText}>Uploading & Verifying...</Text>
                    </>
                  ) : (
                    <>
                      <Upload size={14} color="#000" style={{ marginRight: 6 }} />
                      <Text style={styles.uploadBtnText}>
                        {doc ? "Replace Document Photo" : "Upload Document Photo"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  backBtn: {
    padding: 6,
    backgroundColor: "#161616",
    borderRadius: 10,
    marginRight: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#121216",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 20,
  },
  infoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  infoTitle: {
    color: "#f59e0b",
    fontSize: 13,
    fontWeight: "700",
  },
  infoText: {
    color: "#a3a3a3",
    fontSize: 11,
    lineHeight: 16,
  },
  center: {
    paddingVertical: 50,
    alignItems: "center",
  },
  loadingText: {
    color: "#737373",
    fontSize: 12,
    marginTop: 10,
  },
  slotsContainer: {
    gap: 12,
  },
  slotCard: {
    backgroundColor: "#121212",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e1e1e",
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  slotTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  slotDesc: {
    color: "#737373",
    fontSize: 11,
    marginTop: 2,
    maxWidth: 220,
  },
  badgeVerified: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeVerifiedText: {
    color: "#10b981",
    fontSize: 10,
    fontWeight: "700",
  },
  badgePending: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePendingText: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "700",
  },
  badgeRejected: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeRejectedText: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "700",
  },
  badgeUnset: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeUnsetText: {
    color: "#737373",
    fontSize: 10,
    fontWeight: "500",
  },
  rejectionBox: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  rejectionTitle: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "700",
  },
  rejectionText: {
    color: "#fca5a5",
    fontSize: 11,
    marginTop: 2,
  },
  uploadBtn: {
    backgroundColor: "#f59e0b",
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtnText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
  },
});
