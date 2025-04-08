import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 💡 Debt calculation helper
const calculateDebts = (expenses: any[]) => {
  const balances: Record<string, number> = {};

  expenses.forEach((expense) => {
    const { paidBy, splits } = expense;

    splits.forEach((split: any) => {
      const { name, owes } = split;
      if (name === paidBy) return;

      const key = `${name}->${paidBy}`;
      balances[key] = (balances[key] || 0) + owes;
    });
  });

  // Simplify mutual debts
  const simplifiedDebts: { from: string; to: string; amount: number }[] = [];

  Object.entries(balances).forEach(([key, amount]) => {
    const [from, to] = key.split('->');
    const reverseKey = `${to}->${from}`;

    if (balances[reverseKey]) {
      if (balances[reverseKey] > amount) {
        balances[reverseKey] -= amount;
        delete balances[key];
      } else {
        balances[key] = amount - balances[reverseKey];
        delete balances[reverseKey];
      }
    }
  });

  Object.entries(balances).forEach(([key, amount]) => {
    if (amount > 0) {
      const [from, to] = key.split('->');
      simplifiedDebts.push({ from, to, amount });
    }
  });

  return simplifiedDebts;
};

export default function GroupDetailsScreen() {
  const { groupId } = useLocalSearchParams();
  const [group, setGroup] = useState<any>(null);
  const router = useRouter();
  const id = typeof groupId === 'string' ? groupId : groupId?.[0];

  useFocusEffect(
    useCallback(() => {
      if (id) loadGroup();
    }, [id])
  );

  const loadGroup = async () => {
    const storedGroups = await AsyncStorage.getItem('groups');
    if (storedGroups && id) {
      const allGroups = JSON.parse(storedGroups);
      const selectedGroup = allGroups.find((g: any) => String(g.id) === String(id));
      setGroup(selectedGroup);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    const storedGroups = await AsyncStorage.getItem('groups');
    if (!storedGroups || !id) return;

    const allGroups = JSON.parse(storedGroups);
    const updatedGroups = allGroups.map((g: any) => {
      if (String(g.id) === String(id)) {
        return {
          ...g,
          expenses: g.expenses.filter((e: any) => e.id !== expenseId),
        };
      }
      return g;
    });

    await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
    loadGroup();
  };

  const renderExpense = ({ item }: { item: any }) => (
    <View style={styles.expenseItem}>
      <View>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseAmount}>₹ {parseFloat(item.amount || 0).toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deleteExpense(item.id)}
      >
        <Text style={styles.deleteText}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  const balances = group?.expenses?.length ? calculateDebts(group.expenses) : [];

  return (
    <View style={styles.container}>
      {group ? (
        <>
          <Text style={styles.heading}>{group.name} - Expenses</Text>

          {balances.length > 0 && (
            <View style={styles.balancesContainer}>
              <Text style={styles.balancesTitle}>💸 Balances</Text>
              {balances.map((debt, idx) => (
                <Text key={idx} style={styles.balanceText}>
                  {debt.from} owes {debt.to} ₹{debt.amount.toFixed(2)}
                </Text>
              ))}
            </View>
          )}

          <FlatList
            data={group.expenses || []}
            keyExtractor={(item) => item.id}
            renderItem={renderExpense}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No expenses yet.</Text>
            }
            style={{ marginBottom: 20 }}
          />

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              router.push({
                pathname: '/add-expense',
                params: { groupId: id },
              })
            }
          >
            <Text style={styles.btnText}>➕ Add Expense</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.emptyText}>Loading group...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    padding: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 20,
    textAlign: 'center',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#00B894',
    shadowColor: '#ccc',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  expenseTitle: {
    fontSize: 18,
    color: '#2d3436',
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 16,
    color: '#636e72',
  },
  deleteBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  deleteText: {
    fontSize: 20,
    color: '#d63031',
  },
  primaryBtn: {
    backgroundColor: '#00B894',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#636e72',
    marginTop: 12,
  },
  balancesContainer: {
    marginBottom: 20,
    backgroundColor: '#dfe6e9',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  balancesTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#2d3436',
  },
  balanceText: {
    fontSize: 14,
    color: '#2d3436',
    marginBottom: 4,
    textAlign: 'center',
  },
});
