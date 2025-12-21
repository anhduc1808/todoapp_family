import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function FamilyListScreen({ navigation }) {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  const loadFamilies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/families');
      setFamilies(res.data.families || []);
    } catch (e) {
      // handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFamilies();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nhóm gia đình</Text>
        <Button title="Đăng xuất" color="#ef4444" onPress={logout} />
      </View>
      {loading ? (
        <Text>Đang tải...</Text>
      ) : (
        <FlatList
          data={families}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Tasks', { familyId: item.id })}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 8,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});
