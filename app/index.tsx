import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const [groups, setGroups] = useState<any[]>([]);
  const router = useRouter();

  const loadGroups = async () => {
    try {
      const storedGroups = await AsyncStorage.getItem('groups');
      if (storedGroups) {
        setGroups(JSON.parse(storedGroups));
      } else {
        setGroups([]);
      }
    } catch (err) {
      console.error('Failed to load groups', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [])
  );

  const deleteGroup = async (groupId: string) => {
    console.log('Attempting to delete group:', groupId);
    const storedGroups = await AsyncStorage.getItem('groups');
    if (!storedGroups) return;
    const allGroups = JSON.parse(storedGroups);
    const updatedGroups = allGroups.filter((g: any) => String(g.id) !== String(groupId));
    console.log('Updated groups after filter:', updatedGroups);
    await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
    setGroups(updatedGroups); // update UI directly
  };

  const renderGroup = ({ item }: { item: any }) => (
    <View style={styles.groupItem}>
      <TouchableOpacity
        style={styles.groupTextWrapper}
        onPress={() =>
          router.push({ pathname: '/group-details', params: { groupId: item.id } })
        }
      >
        <Text style={styles.groupName}>{item.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteGroup(String(item.id))}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🏠 Your Groups</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderGroup}
        ListEmptyComponent={<Text style={styles.emptyText}>No groups yet. Create one!</Text>}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/create-group')}
      >
        <Text style={styles.addButtonText}>➕ Create New Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f1f2f6',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2d3436',
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#0984e3',
    shadowColor: '#ccc',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  groupTextWrapper: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    color: '#2d3436',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteText: {
    fontSize: 18,
    color: '#d63031',
  },
  addButton: {
    backgroundColor: '#00b894',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#636e72',
    marginTop: 12,
  },
});
