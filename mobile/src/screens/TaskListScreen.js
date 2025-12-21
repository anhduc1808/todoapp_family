import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button } from 'react-native';
import api from '../api/client';

export default function TaskListScreen({ route, navigation }) {
  const { familyId } = route.params;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/families/${familyId}/tasks`);
      setTasks(res.data.tasks || []);
    } catch (e) {
      // handle
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!title) return;
    try {
      await api.post(`/families/${familyId}/tasks`, { title });
      setTitle('');
      loadTasks();
    } catch (e) {
      // handle
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTasks();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Công việc gia đình #{familyId}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Thêm công việc mới..."
          value={title}
          onChangeText={setTitle}
        />
        <Button title="Thêm" onPress={createTask} />
      </View>
      {loading ? (
        <Text>Đang tải...</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardStatus}>Trạng thái: {item.status}</Text>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 8,
    backgroundColor: 'white',
    marginRight: 8,
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
  cardStatus: {
    fontSize: 12,
    color: '#6b7280',
  },
});
