import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const CategoryRow = ({ categories, selectedCategory, onSelectCategory }) => {
  const allCategories = ['All', ...categories];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category || (category === 'All' && selectedCategory === 'all');
          return (
            <TouchableOpacity
              key={category}
              style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
              onPress={() => onSelectCategory(category === 'All' ? 'all' : category)}
            >
              <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  categoryPillActive: {
    backgroundColor: '#6f4cff',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
});

export default CategoryRow;

