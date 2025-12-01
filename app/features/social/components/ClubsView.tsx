/**
 * Clubs View Component (Placeholder)
 * features/social/components/ClubsView.tsx
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface ClubsViewProps {
  onBack: () => void;
  userId: string;
}

export function ClubsView({ onBack }: ClubsViewProps) {
  // Mock clubs data - TODO: Create useClubs hook when clubs API is available
  const myClubs = [
    { id: '1', name: 'Chess Enthusiasts', members: 1250, activity: 'Very Active', icon: '♔', role: 'Member' },
    { id: '2', name: 'Blitz Masters', members: 890, activity: 'Active', icon: '⚡', role: 'Admin' },
    { id: '3', name: 'Strategic Minds', members: 2100, activity: 'Moderate', icon: '🧠', role: 'Member' },
  ];

  const discoverClubs = [
    { id: '4', name: 'Endgame Academy', members: 3400, activity: 'Very Active', icon: '🎓' },
    { id: '5', name: 'Tactics Training', members: 1800, activity: 'Active', icon: '🎯' },
    { id: '6', name: 'Opening Theory Club', members: 950, activity: 'Active', icon: '📚' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Clubs</Text>
      <Text style={styles.subtitle}>Member of {myClubs.length} clubs</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>+ Create Club</Text>
      </TouchableOpacity>

      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>My Clubs</Text>
        {myClubs.map(club => <ClubCard key={club.id} {...club} />)}
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Discover</Text>
        {discoverClubs.map(club => <ClubCard key={club.id} {...club} role={undefined} />)}
      </View>
    </ScrollView>
  );
}

function ClubCard({ name, members, activity, icon, role }: any) {
  return (
    <View style={styles.clubCard}>
      <Text style={styles.clubIcon}>{icon}</Text>
      <View style={styles.clubDetails}>
        <Text style={styles.clubName}>{name}</Text>
        <Text style={styles.clubInfo}>{members.toLocaleString()} members • {activity}</Text>
        {role && <Text style={styles.clubRole}>{role}</Text>}
      </View>
      <TouchableOpacity style={role ? styles.viewButton : styles.joinButton}>
        <Text style={role ? styles.viewButtonText : styles.joinButtonText}>{role ? 'View' : 'Join'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  content: { padding: 20 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, marginBottom: 16 },
  backButtonText: { fontSize: 16, color: '#FF9F0A' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#000' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  button: { backgroundColor: '#FF9F0A', borderRadius: 10, padding: 16, marginBottom: 20, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  categorySection: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#000', marginBottom: 16 },
  clubCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  clubIcon: { fontSize: 32, marginRight: 12 },
  clubDetails: { flex: 1 },
  clubName: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  clubInfo: { fontSize: 13, color: '#666', marginBottom: 4 },
  clubRole: { fontSize: 12, color: '#FF9F0A', fontWeight: '600' },
  viewButton: { borderWidth: 1, borderColor: '#FF9F0A', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  viewButtonText: { color: '#FF9F0A', fontSize: 14, fontWeight: '600' },
  joinButton: { backgroundColor: '#FF9F0A', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  joinButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
