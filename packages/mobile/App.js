import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";

// Importar hooks y componentes
import useAuth from "./src/hooks/useAuth";
import useSupabaseProjects from "./src/hooks/useSupabaseProjects";
import AuthScreen from "./src/screens/AuthScreen";
import LoadingScreen from "./src/screens/LoadingScreen";

export default function App() {
  // Hooks de autenticación y datos
  const {
    user,
    loading: authLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  } = useAuth();
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    createProject,
    createTask,
    updateTaskStatus,
    deleteTask: deleteTaskFromDB,
    fetchProjects, // Agregar función para recargar datos
  } = useSupabaseProjects(user?.id);

  // Estado para la navegación
  const [currentScreen, setCurrentScreen] = useState("home");
  const [selectedProject, setSelectedProject] = useState(null);

  // Estado para controlar el scroll durante drag
  const [isDraggingAnyTask, setIsDraggingAnyTask] = useState(false);

  // Estado para mostrar la zona de drop activa
  const [activeDropZone, setActiveDropZone] = useState(null);

  // Mostrar pantalla de carga durante la verificación inicial
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Mostrar pantalla de autenticación si no hay usuario
  if (!user) {
    return (
      <AuthScreen
        onSignIn={signIn}
        onSignUp={signUp}
        onSignInWithGoogle={signInWithGoogle}
        loading={authLoading}
      />
    );
  }

  const handleNewProject = () => {
    Alert.prompt(
      "Nuevo Proyecto",
      "Ingresa el nombre del proyecto:",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Crear",
          onPress: async (projectName) => {
            if (projectName && projectName.trim()) {
              const result = await createProject(projectName.trim());
              if (result.error) {
                Alert.alert(
                  "Error",
                  "No se pudo crear el proyecto: " + result.error
                );
              }
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleProjectPress = (project) => {
    setSelectedProject(project);
    setCurrentScreen("projectDetail");
  };

  const handleBackToHome = () => {
    setCurrentScreen("home");
    setSelectedProject(null);
  };

  const getTotalTasks = (project) => {
    return (
      project.tasks.pending.length +
      project.tasks.inProgress.length +
      project.tasks.completed.length
    );
  };

  const getCompletedTasks = (project) => {
    return project.tasks.completed.length;
  };

  const handleAddTask = (status) => {
    Alert.prompt(
      "Nueva Tarea",
      "Ingresa el título de la tarea:",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Crear",
          onPress: (taskTitle) => {
            if (taskTitle && taskTitle.trim()) {
              Alert.prompt(
                "Descripción",
                "Ingresa una descripción (opcional):",
                [
                  {
                    text: "Omitir",
                    onPress: () =>
                      addTaskToProject(taskTitle.trim(), "", status),
                  },
                  {
                    text: "Agregar",
                    onPress: (description) =>
                      addTaskToProject(
                        taskTitle.trim(),
                        description || "",
                        status
                      ),
                  },
                ]
              );
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const addTaskToProject = async (title, description, status) => {
    if (!selectedProject) return;

    const result = await createTask(
      selectedProject.id,
      title,
      description,
      status
    );
    if (result.error) {
      Alert.alert("Error", "No se pudo crear la tarea: " + result.error);
    }
  };

  const moveTask = async (task, fromStatus, toStatus) => {
    if (!selectedProject) return;

    const result = await updateTaskStatus(
      task.id,
      fromStatus,
      toStatus,
      selectedProject.id
    );
    if (result.error) {
      Alert.alert("Error", "No se pudo mover la tarea: " + result.error);
    }
  };

  const deleteTask = (task, status) => {
    Alert.alert("Eliminar Tarea", `¿Estás seguro de eliminar "${task.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          if (!selectedProject) return;

          const result = await deleteTaskFromDB(
            task.id,
            status,
            selectedProject.id
          );
          if (result.error) {
            Alert.alert(
              "Error",
              "No se pudo eliminar la tarea: " + result.error
            );
          }
        },
      },
    ]);
  };

  // Componente para tareas arrastrables usando React Native nativo
  const DraggableTask = ({ task, status, cardStyle }) => {
    const pan = new Animated.ValueXY();
    const scale = new Animated.Value(1);
    const isDragging = React.useRef(false);
    const lastDropZone = React.useRef(null);

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Hacer menos sensible para evitar activaciones accidentales
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },

      // CRÍTICO: No permitir terminación del drag por otros componentes
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,

      // Asegurar que el PanResponder mantenga el control
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // Si ya estamos arrastrando, mantener el control
        if (isDragging.current) return true;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },

      onPanResponderGrant: () => {
        console.log("🎯 Drag iniciado");
        isDragging.current = true;
        setIsDraggingAnyTask(true);

        Animated.spring(scale, {
          toValue: 1.08,
          useNativeDriver: false,
        }).start();

        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (evt, gestureState) => {
        if (!isDragging.current) return;

        // Mantener el drag activo con cualquier movimiento
        pan.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });

        // Solo actualizar zona si se movió lo suficiente (reducir umbral)
        const totalMovement =
          Math.abs(gestureState.dx) + Math.abs(gestureState.dy);
        if (totalMovement < 15) return; // Reducir de 30px a 15px

        // Usar solo pageY para detección más precisa
        const currentY = evt.nativeEvent.pageY;
        let currentDropZone = null;

        // Ajustar rangos basados en la estructura real
        if (currentY > 150 && currentY < 280) {
          currentDropZone = "pending";
        } else if (currentY >= 280 && currentY < 410) {
          currentDropZone = "inProgress";
        } else if (currentY >= 410 && currentY < 540) {
          currentDropZone = "completed";
        }

        // Solo actualizar si cambió Y es diferente del status actual
        if (
          currentDropZone &&
          currentDropZone !== status &&
          currentDropZone !== lastDropZone.current
        ) {
          lastDropZone.current = currentDropZone;
          setActiveDropZone(currentDropZone);
          console.log(
            `📍 Zona: ${currentDropZone} (Y: ${currentY}) - Total movement: ${totalMovement}`
          );
        } else if (!currentDropZone && lastDropZone.current) {
          // Limpiar zona si no está sobre ninguna válida
          lastDropZone.current = null;
          setActiveDropZone(null);
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        console.log("🏁 Drag terminado (RELEASE)");

        isDragging.current = false;
        setIsDraggingAnyTask(false);
        setActiveDropZone(null);

        pan.flattenOffset();

        // Reducir umbral mínimo para drop
        const totalMovement =
          Math.abs(gestureState.dx) + Math.abs(gestureState.dy);

        if (totalMovement < 20) {
          // Reducir de 40px a 20px
          console.log("🚫 Movimiento insuficiente, no se mueve");
          // Solo animar de vuelta
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: false,
            }),
          ]).start();

          lastDropZone.current = null;
          return;
        }

        // Determinar zona final usando las mismas coordenadas que en onMove
        const finalY = evt.nativeEvent.pageY;
        let dropZone = null;

        if (finalY > 150 && finalY < 280) {
          dropZone = "pending";
        } else if (finalY >= 280 && finalY < 410) {
          dropZone = "inProgress";
        } else if (finalY >= 410 && finalY < 540) {
          dropZone = "completed";
        }

        // Animación de retorno
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }),
        ]).start();

        console.log(
          `📊 Movimiento: ${totalMovement}, De: ${status}, A: ${dropZone}, Y: ${finalY}`
        );

        // Mover solo si la zona es válida y diferente
        if (dropZone && dropZone !== status) {
          console.log(`✅ Moviendo tarea de ${status} a ${dropZone}`);
          setTimeout(() => moveTask(task, status, dropZone), 50);
        } else {
          console.log(`🔄 Mantiene en ${status}`);
        }

        lastDropZone.current = null;
      },

      onPanResponderTerminate: () => {
        console.log("❌ Drag TERMINADO FORZOSAMENTE");
        isDragging.current = false;
        setIsDraggingAnyTask(false);
        setActiveDropZone(null);
        lastDropZone.current = null;
        pan.flattenOffset();

        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }),
        ]).start();
      },
    });

    return (
      <Animated.View
        style={[
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scale },
            ],
            zIndex: isDragging.current ? 999 : 1,
            elevation: isDragging.current ? 999 : 2,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.taskCard, cardStyle]}
          onLongPress={() => !isDragging.current && deleteTask(task, status)}
          activeOpacity={0.9}
          disabled={isDragging.current}
          delayLongPress={800}
        >
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>{task.name}</Text>
            {task.description ? (
              <Text style={styles.taskDescription}>{task.description}</Text>
            ) : null}
          </View>
          <View style={styles.dragIndicator}>
            <Text style={styles.dragIndicatorText}>⋮⋮</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Renderizar pantalla de inicio
  const renderHomeScreen = () => (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header con información del usuario */}
        <View style={styles.userHeader}>
          <Text style={styles.title}>Focus Locus Mobile</Text>
          <Text style={styles.subtitle}>Gestión de Proyectos</Text>
          {user?.user_metadata?.full_name && (
            <Text style={styles.welcomeText}>
              Bienvenido, {user.user_metadata.full_name}
            </Text>
          )}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={async () => {
              const result = await signOut();
              if (result.error) {
                Alert.alert("Error", "No se pudo cerrar sesión");
              }
            }}
          >
            <Text style={styles.signOutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Mostrar estado de carga o error */}
        {projectsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {projectsError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchProjects()}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : projectsLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando proyectos...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{projects.length}</Text>
                <Text style={styles.statLabel}>Proyectos</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {projects.reduce((sum, p) => getTotalTasks(p), 0)}
                </Text>
                <Text style={styles.statLabel}>Tareas Total</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {projects.reduce((sum, p) => sum + getCompletedTasks(p), 0)}
                </Text>
                <Text style={styles.statLabel}>Completadas</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Mis Proyectos</Text>

            {projects.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No tienes proyectos aún. ¡Crea tu primer proyecto!
                </Text>
              </View>
            ) : (
              projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => handleProjectPress(project)}
                >
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View style={styles.projectStats}>
                    <Text style={styles.projectStat}>
                      {getCompletedTasks(project)}/{getTotalTasks(project)}{" "}
                      tareas completadas
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${
                              getTotalTasks(project) > 0
                                ? (getCompletedTasks(project) /
                                    getTotalTasks(project)) *
                                  100
                                : 0
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleNewProject}>
          <Text style={styles.addButtonText}>+ Nuevo Proyecto</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  // Renderizar pantalla de detalles del proyecto
  const renderProjectDetailScreen = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToHome}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedProject?.name}</Text>
      </View>

      <View style={styles.kanbanContainer}>
        {/* Columna Pendientes */}
        <View
          style={[
            styles.kanbanColumn,
            activeDropZone === "pending" && styles.activeDropZone,
          ]}
        >
          <View style={styles.columnHeader}>
            <Text
              style={[
                styles.columnTitle,
                activeDropZone === "pending" && styles.activeColumnTitle,
              ]}
            >
              📋 Pendientes ({selectedProject?.tasks.pending.length})
            </Text>
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => handleAddTask("pending")}
            >
              <Text style={styles.addTaskButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.columnScroll}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isDraggingAnyTask}
            nestedScrollEnabled={false}
            keyboardShouldPersistTaps="always"
          >
            {selectedProject?.tasks.pending.map((task) => (
              <DraggableTask
                key={task.id}
                task={task}
                status="pending"
                cardStyle={styles.pendingCard}
              />
            ))}
          </ScrollView>
        </View>

        {/* Columna En Curso */}
        <View
          style={[
            styles.kanbanColumn,
            activeDropZone === "inProgress" && styles.activeDropZone,
          ]}
        >
          <View style={styles.columnHeader}>
            <Text
              style={[
                styles.columnTitle,
                activeDropZone === "inProgress" && styles.activeColumnTitle,
              ]}
            >
              ⚡ En Curso ({selectedProject?.tasks.inProgress.length})
            </Text>
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => handleAddTask("inProgress")}
            >
              <Text style={styles.addTaskButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.columnScroll}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isDraggingAnyTask}
            nestedScrollEnabled={false}
            keyboardShouldPersistTaps="always"
          >
            {selectedProject?.tasks.inProgress.map((task) => (
              <DraggableTask
                key={task.id}
                task={task}
                status="inProgress"
                cardStyle={styles.inProgressCard}
              />
            ))}
          </ScrollView>
        </View>

        {/* Columna Terminadas */}
        <View
          style={[
            styles.kanbanColumn,
            activeDropZone === "completed" && styles.activeDropZone,
          ]}
        >
          <View style={styles.columnHeader}>
            <Text
              style={[
                styles.columnTitle,
                activeDropZone === "completed" && styles.activeColumnTitle,
              ]}
            >
              ✅ Terminadas ({selectedProject?.tasks.completed.length})
            </Text>
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => handleAddTask("completed")}
            >
              <Text style={styles.addTaskButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.columnScroll}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isDraggingAnyTask}
            nestedScrollEnabled={false}
            keyboardShouldPersistTaps="always"
          >
            {selectedProject?.tasks.completed.map((task) => (
              <DraggableTask
                key={task.id}
                task={task}
                status="completed"
                cardStyle={styles.completedCard}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );

  return currentScreen === "home"
    ? renderHomeScreen()
    : renderProjectDetailScreen();
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 0,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 15,
    color: "#333",
  },
  projectCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  projectStats: {
    marginTop: 5,
  },
  projectStat: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  addButton: {
    backgroundColor: "#007AFF",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Nuevos estilos para autenticación y usuario
  userHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  signOutButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  // Nuevos estilos para la pantalla de detalles
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  kanbanContainer: {
    padding: 15,
    gap: 15,
    flex: 1,
  },
  kanbanColumn: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    minHeight: 120,
    maxHeight: "85%", // Limitar altura para permitir scroll interno
  },
  columnScroll: {
    flex: 1,
  },
  activeDropZone: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderWidth: 3,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    transform: [{ scale: 1.02 }],
  },
  columnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  activeColumnTitle: {
    color: "#007AFF",
    fontSize: 19,
    textShadowColor: "rgba(0, 122, 255, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  addTaskButton: {
    backgroundColor: "#007AFF",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addTaskButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  taskCard: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 60,
  },
  pendingCard: {
    borderLeftColor: "#FF6B6B",
  },
  inProgressCard: {
    borderLeftColor: "#4ECDC4",
  },
  completedCard: {
    borderLeftColor: "#45B7D1",
  },
  taskContent: {
    flex: 1,
    paddingRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  dragIndicator: {
    width: 50,
    minHeight: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,122,255,0.1)",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(0,122,255,0.2)",
    borderStyle: "dashed",
  },
  dragIndicatorText: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "bold",
    transform: [{ rotate: "90deg" }],
  },
});
