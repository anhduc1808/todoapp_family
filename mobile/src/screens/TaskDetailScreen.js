import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import api from '../api/client';

export default function TaskDetailScreen({ route }) {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);

  useEffect(() => {
    api
      .get(`/tasks/${taskId}`)
      .then((res) => setTask(res.data.task))
      .catch(() => {});
  }, [taskId]);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      {task.description ? <Text style={styles.desc}>{task.description}</Text> : null}
      <Text>Trạng thái: {task.status}</Text>
      <Text>Ưu tiên: {task.priority}</Text>
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  desc: {
    marginBottom: 8,
  },
});
