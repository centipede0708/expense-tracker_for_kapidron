import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function CreateGroupScreen() {
  const [name, setName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const router = useRouter();

  const addMember = () => {
    const trimmed = memberInput.trim();
    if (trimmed && !members.includes(trimmed)) {
      setMembers([...members, trimmed]);
      setMemberInput('');
    }
  };

  const removeMember = (member: string) => {
    setMembers(members.filter((m) => m !== member));
  };

  const createGroup = async () => {
    if (!name || members.length === 0) return;

    const newGroup = {
      id: Date.now().toString(),
      name,
      members,
      expenses: [],
    };

    const storedGroups = await AsyncStorage.getItem('groups');
    const groups = storedGroups ? JSON.parse(storedGroups) : [];

    groups.push(newGroup);
    await AsyncStorage.setItem('groups', JSON.stringify(groups));

    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.heading}>✨ Create a New Group</Text>

      <TextInput
        placeholder="Group Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#b2bec3"
      />

      <View style={styles.addMemberRow}>
        <TextInput
          placeholder="Add Member"
          value={memberInput}
          onChangeText={setMemberInput}
          onSubmitEditing={addMember}
          style={[styles.input, { flex: 1 }]}
          placeholderTextColor="#b2bec3"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addMember}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => removeMember(item)} style={styles.memberItem}>
            <Text style={styles.memberText}>👤 {item}</Text>
            <Text style={styles.removeText}>❌</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No members added yet.</Text>
        }
        style={{ marginVertical: 15 }}
      />

      <TouchableOpacity
        style={[
          styles.createBtn,
          (!name || members.length === 0) && styles.disabledBtn,
        ]}
        onPress={createGroup}
        disabled={!name || members.length === 0}
      >
        <Text style={styles.createBtnText}>✅ Create Group</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    padding: 24,
    paddingTop: 60,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: '#2d3436',
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addBtn: {
    backgroundColor: '#00B894',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00B894',
  },
  memberText: {
    fontSize: 16,
    color: '#2d3436',
  },
  removeText: {
    fontSize: 16,
    color: '#d63031',
  },
  emptyText: {
    textAlign: 'center',
    color: '#636e72',
    marginTop: 8,
  },
  createBtn: {
    backgroundColor: '#00B894',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledBtn: {
    backgroundColor: '#b2bec3',
  },
});
