import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import useProjects from "../hooks/useProjects";

export default function ProjectDetailScreen({ route, navigation }) {
  const { projectName } = route.params;
  const { getProjectTasks, updateProjectTasks } = useProjects();

  const [tasks, setTasks] = useState(() => getProjectTasks(projectName));
  const [modalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("normal");
  const [taskExpiration, setTaskExpiration] = useState("");

  // Actualizar las tareas cuando cambie el proyecto
  React.useEffect(() => {
    setTasks(getProjectTasks(projectName));
  }, [projectName, getProjectTasks]);

  const handleAddTask = async () => {
    if (!taskName.trim()) return;

    const newTask = {
      id:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
      nombre: taskName.trim(),
      descripcion: taskDescription.trim(),
      prioridad: taskPriority,
      expira:
        taskExpiration ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
    };

    const updatedTasks = {
      ...tasks,
      pendientes: [...tasks.pendientes, newTask],
    };

    setTasks(updatedTasks);
    await updateProjectTasks(projectName, updatedTasks);

    // Reset form
    setTaskName("");
    setTaskDescription("");
    setTaskPriority("normal");
    setTaskExpiration("");
    setModalVisible(false);
  };

  const moveTask = async (taskId, fromList, toList) => {
    const task = tasks[fromList].find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = {
      ...tasks,
      [fromList]: tasks[fromList].filter((t) => t.id !== taskId),
      [toList]: [...tasks[toList], task],
    };

    setTasks(updatedTasks);
    await updateProjectTasks(projectName, updatedTasks);
  };

  const deleteTask = async (taskId, listName) => {
    Alert.alert(
      "Eliminar tarea",
      "¿Estás seguro de que quieres eliminar esta tarea?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const updatedTasks = {
              ...tasks,
              [listName]: tasks[listName].filter((t) => t.id !== taskId),
            };
            setTasks(updatedTasks);
            await updateProjectTasks(projectName, updatedTasks);
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "alta":
        return "#ef4444";
      case "normal":
        return "#3b82f6";
      case "baja":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getPriorityEmoji = (priority) => {
    switch (priority) {
      case "alta":
        return "🔴";
      case "normal":
        return "🔵";
      case "baja":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const renderTask = ({ item: task, listName }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskName}>{task.nombre}</Text>
        <View style={styles.taskActions}>
          <Text style={styles.priorityEmoji}>
            {getPriorityEmoji(task.prioridad)}
          </Text>
          <TouchableOpacity
            onPress={() => deleteTask(task.id, listName)}
            style={styles.deleteTaskButton}
          >
            <Text style={styles.deleteTaskText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {task.descripcion ? (
        <Text style={styles.taskDescription}>{task.descripcion}</Text>
      ) : null}

      <View style={styles.taskFooter}>
        <Text style={styles.taskExpiration}>
          📅 {new Date(task.expira).toLocaleDateString()}
        </Text>
        <View style={styles.taskMoveButtons}>
          {listName !== "pendientes" && (
            <TouchableOpacity
              style={[styles.moveButton, styles.moveBackButton]}
              onPress={() => moveTask(task.id, listName, "pendientes")}
            >
              <Text style={styles.moveButtonText}>⬅️</Text>
            </TouchableOpacity>
          )}
          {listName === "pendientes" && (
            <TouchableOpacity
              style={[styles.moveButton, styles.moveForwardButton]}
              onPress={() => moveTask(task.id, listName, "enCurso")}
            >
              <Text style={styles.moveButtonText}>➡️</Text>
            </TouchableOpacity>
          )}
          {listName === "enCurso" && (
            <TouchableOpacity
              style={[styles.moveButton, styles.moveForwardButton]}
              onPress={() => moveTask(task.id, listName, "terminadas")}
            >
              <Text style={styles.moveButtonText}>✅</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderTaskList = (listName, listTitle, listTasks, emptyText) => (
    <View style={styles.taskList}>
      <Text style={styles.taskListTitle}>
        {listTitle} ({listTasks.length})
      </Text>
      {listTasks.length > 0 ? (
        <FlatList
          data={listTasks}
          renderItem={({ item }) => renderTask({ item, listName })}
          keyExtractor={(item) => item.id}
          style={styles.taskFlatList}
          nestedScrollEnabled={true}
        />
      ) : (
        <Text style={styles.emptyTaskText}>{emptyText}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.projectTitle} numberOfLines={1}>
          {projectName}
        </Text>
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addTaskButtonText}>+ Tarea</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderTaskList(
          "pendientes",
          "📋 Pendientes",
          tasks.pendientes,
          "No hay tareas pendientes"
        )}
        {renderTaskList(
          "enCurso",
          "⏳ En Curso",
          tasks.enCurso,
          "No hay tareas en curso"
        )}
        {renderTaskList(
          "terminadas",
          "✅ Terminadas",
          tasks.terminadas,
          "No hay tareas terminadas"
        )}
      </ScrollView>

      {/* Modal para agregar/editar tarea */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Tarea</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la tarea"
              value={taskName}
              onChangeText={setTaskName}
              autoFocus={true}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción (opcional)"
              value={taskDescription}
              onChangeText={setTaskDescription}
              multiline={true}
              numberOfLines={3}
            />

            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Prioridad:</Text>
              <View style={styles.priorityButtons}>
                {["alta", "normal", "baja"].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      taskPriority === priority &&
                        styles.selectedPriorityButton,
                      {
                        backgroundColor:
                          taskPriority === priority
                            ? getPriorityColor(priority)
                            : "#f3f4f6",
                      },
                    ]}
                    onPress={() => setTaskPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        taskPriority === priority &&
                          styles.selectedPriorityText,
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setTaskName("");
                  setTaskDescription("");
                  setTaskPriority("normal");
                  setTaskExpiration("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddTask}
              >
                <Text style={styles.confirmButtonText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "500",
  },
  projectTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginHorizontal: 16,
  },
  addTaskButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addTaskButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  taskList: {
    marginVertical: 16,
  },
  taskListTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  taskFlatList: {
    maxHeight: 200,
  },
  emptyTaskText: {
    textAlign: "center",
    color: "#9ca3af",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  taskItem: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  taskName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  deleteTaskButton: {
    padding: 4,
  },
  deleteTaskText: {
    fontSize: 16,
  },
  taskDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskExpiration: {
    fontSize: 12,
    color: "#9ca3af",
  },
  taskMoveButtons: {
    flexDirection: "row",
  },
  moveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 4,
  },
  moveBackButton: {
    backgroundColor: "#f3f4f6",
  },
  moveForwardButton: {
    backgroundColor: "#dbeafe",
  },
  moveButtonText: {
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 32,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  priorityContainer: {
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  priorityButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  selectedPriorityButton: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  priorityButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  selectedPriorityText: {
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  confirmButton: {
    backgroundColor: "#3b82f6",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
