import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar'; // ✅ Added for status bar styling

export default function AddExpenseScreen() {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [group, setGroup] = useState<any>(null);
  const [paidBy, setPaidBy] = useState('');
  const [customSplits, setCustomSplits] = useState<{ [member: string]: string }>({});

  const id = typeof groupId === 'string' ? groupId : groupId?.[0];

  useEffect(() => {
    loadGroup();
  }, []);

  const loadGroup = async () => {
    const storedGroups = await AsyncStorage.getItem('groups');
    if (storedGroups && id) {
      const allGroups = JSON.parse(storedGroups);
      const selectedGroup = allGroups.find((g: any) => g.id === id);
      setGroup(selectedGroup);
      if (selectedGroup?.members?.length) {
        setPaidBy(selectedGroup.members[0]);
        const defaultSplits: { [member: string]: string } = {};
        selectedGroup.members.forEach((m: string) => (defaultSplits[m] = '0'));
        setCustomSplits(defaultSplits);
      }
    }
  };

  const handleAddExpense = async () => {
    if (!title || !amount || !paidBy) {
      Alert.alert('Please fill all fields');
      return;
    }

    const total = parseFloat(amount);
    const splitValues = Object.values(customSplits).map(Number);
    const totalSplit = splitValues.reduce((a, b) => a + b, 0);

    if (Math.abs(total - totalSplit) > 0.01) {
      Alert.alert('Split does not match total amount');
      return;
    }

    const splits = Object.entries(customSplits).map(([member, val]) => ({
      name: member,
      owes: parseFloat(val),
    }));

    const newExpense = {
      id: Date.now().toString(),
      title,
      amount: total,
      paidBy,
      splits,
    };

    const storedGroups = await AsyncStorage.getItem('groups');
    if (!storedGroups || !id) return;

    const allGroups = JSON.parse(storedGroups);
    const updatedGroups = allGroups.map((g: any) =>
      g.id === id ? { ...g, expenses: [...(g.expenses || []), newExpense] } : g
    );

    await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
    router.back();
  };

  const handleSplitChange = (member: string, value: string) => {
    setCustomSplits((prev) => ({ ...prev, [member]: value }));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f1f2f6" /> {/* ✅ Ensures status bar matches background */}
      <Text style={styles.heading}>Add Expense</Text>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      {group && (
        <>
          <Text style={styles.label}>Paid By</Text>
          <Picker
            selectedValue={paidBy}
            onValueChange={(val: React.SetStateAction<string>) => setPaidBy(val)}
            style={styles.input}
          >
            {group.members.map((m: string) => (
              <Picker.Item label={m} value={m} key={m} />
            ))}
          </Picker>

          <Text style={styles.label}>Split Amounts (must total ₹{amount || 0})</Text>
          {group.members.map((m: string) => (
            <View key={m} style={styles.splitRow}>
              <Text style={{ flex: 1 }}>{m} owes ₹</Text>
              <TextInput
                value={customSplits[m]}
                onChangeText={(val) => handleSplitChange(m, val)}
                keyboardType="numeric"
                style={styles.splitInput}
              />
            </View>
          ))}
        </>
      )}

      <Button title="Save Expense" onPress={handleAddExpense} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6', // ✅ Light background to fix black screen in build
    padding: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d3436',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff', // ✅ Ensures TextInput background is always white
  },
  label: { fontWeight: 'bold', marginBottom: 10 },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  splitInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginLeft: 10,
    backgroundColor: '#fff', // ✅ Input field background for build consistency
  },
});
