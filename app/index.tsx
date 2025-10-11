import { Text, View, StyleSheet, Touchable, TouchableOpacity } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.expense}>
        <Text style={{ fontSize: 20, fontWeight: "bold" , color: "#0000"}}>
          Total Expense:
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold" , color: "#0000"}}>
          $1000
        </Text>
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%" , marginTop: 20}}>
          <View >
            <Text style={{ fontSize: 18, fontWeight: "bold" , color: "#0000"}}>
              Total Income:
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "bold" , color: "#0000"}}>
              $1000
            </Text>
          </View>
          <View >
            <Text style={{ fontSize: 18, fontWeight: "bold" , color: "#0000"}}>
              Total Balance:
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "bold" , color: "#0000"}}>
              $1000
            </Text>
          </View>
        </View>
      </View>
      {/* <View style={styles.expense}>
        <Text style={{ fontSize: 20, fontWeight: "bold" , color: "#0000"}}>
          Total Savings:
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold" , color: "#0000"}}>
          $1000
        </Text>
      </View>
      <View style={styles.expense}>
        <Text style={{ fontSize: 20, fontWeight: "bold" , color: "#0000"}}>
          Total Investments:
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold" , color: "#0000"}}>
          $1000
        </Text>
      </View> */}
      <TouchableOpacity style={{ backgroundColor: "#1e7cf8ff", padding: 20, borderRadius: 10, marginTop: 20, boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)"  }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" , color: "#fff"}}>
          Add Expense
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  expense: {
    width: "80%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
  },
})
