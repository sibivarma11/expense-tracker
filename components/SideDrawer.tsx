import { Ionicons } from '@expo/vector-icons';
import { Animated, Dimensions, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface SideDrawerProps {
  animatedTranslateX: Animated.AnimatedAddition<number>;
  isDark: boolean;
  onToggleTheme: () => void;
  onExport: () => void;
}

export default function SideDrawer({ animatedTranslateX, isDark, onToggleTheme, onExport }: SideDrawerProps) {
  return (
    <Animated.View style={[styles.drawer, isDark && styles.drawerDark, { transform: [{ translateX: animatedTranslateX }] }]}>
      <View style={styles.drawerContent}>
        {/* <TouchableOpacity style={styles.drawerItem}>
          <Ionicons name="grid-outline" size={24} color={isDark ? "#fff" : "#333"} />
          <Text style={[styles.drawerItemText, isDark && styles.drawerItemTextDark]}>Dashboard</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity style={styles.drawerItem}>
          <Ionicons name="bar-chart-outline" size={24} color={isDark ? "#fff" : "#333"} />
          <Text style={[styles.drawerItemText, isDark && styles.drawerItemTextDark]}>Reports</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.drawerItem} onPress={onExport}>
          <Ionicons name="download-outline" size={24} color={isDark ? "#fff" : "#333"} />
          <Text style={[styles.drawerItemText, isDark && styles.drawerItemTextDark]}>Export Data</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.drawerItem}>
          <Ionicons name="settings-outline" size={24} color={isDark ? "#fff" : "#333"} />
          <Text style={[styles.drawerItemText, isDark && styles.drawerItemTextDark]}>Settings</Text>
        </TouchableOpacity> */}
        <View style={styles.drawerItem}>
          <Ionicons
            name={isDark ? "moon-outline" : "sunny-outline"}
            size={24}
            color={isDark ? "#fff" : "#333"}
          />
          <Text style={[styles.drawerItemText, isDark && styles.drawerItemTextDark]} />
          <Switch
            value={isDark}
            onValueChange={onToggleTheme}
            trackColor={{ false: "#ccc", true: "#555" }}
            thumbColor={isDark ? "#fff" : "#333"}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  drawerDark: {
    backgroundColor: "#1c1c1e",
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
    marginTop: 40,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  drawerItemText: {
    fontSize: 18,
    color: "#333",
    marginLeft: 15,
    flex: 1,
  },
  drawerItemTextDark: {
    color: "#fff",
  },
});