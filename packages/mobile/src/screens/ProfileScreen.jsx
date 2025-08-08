import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import useProjects from "../hooks/useProjects";

export default function ProfileScreen() {
  const { projects, projectTasks, isLoaded } = useProjects();

  // Calcular estadísticas
  const getTotalTasks = () => {
    let totalTasks = 0;
    projects.forEach((projectName) => {
      const tasks = projectTasks[projectName];
      if (tasks) {
        totalTasks +=
          tasks.pendientes.length +
          tasks.enCurso.length +
          tasks.terminadas.length;
      }
    });
    return totalTasks;
  };

  const getCompletedTasks = () => {
    let completedTasks = 0;
    projects.forEach((projectName) => {
      const tasks = projectTasks[projectName];
      if (tasks && tasks.terminadas) {
        completedTasks += tasks.terminadas.length;
      }
    });
    return completedTasks;
  };

  const getPendingTasks = () => {
    let pendingTasks = 0;
    projects.forEach((projectName) => {
      const tasks = projectTasks[projectName];
      if (tasks && tasks.pendientes) {
        pendingTasks += tasks.pendientes.length;
      }
    });
    return pendingTasks;
  };

  const getInProgressTasks = () => {
    let inProgressTasks = 0;
    projects.forEach((projectName) => {
      const tasks = projectTasks[projectName];
      if (tasks && tasks.enCurso) {
        inProgressTasks += tasks.enCurso.length;
      }
    });
    return inProgressTasks;
  };

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Usuario</Text>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>Nombre</Text>
            <Text style={styles.itemValue}>Usuario de Focus Locus</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>Versión</Text>
            <Text style={styles.itemValue}>Mobile v1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estadísticas de Proyectos</Text>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>Proyectos Creados</Text>
            <Text style={styles.itemValue}>{projects.length}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>Total de Tareas</Text>
            <Text style={styles.itemValue}>{getTotalTasks()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Estadísticas de Tareas</Text>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>📋 Tareas Pendientes</Text>
            <Text style={[styles.itemValue, styles.pendingTasks]}>
              {getPendingTasks()}
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>⏳ Tareas en Curso</Text>
            <Text style={[styles.itemValue, styles.inProgressTasks]}>
              {getInProgressTasks()}
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>✅ Tareas Completadas</Text>
            <Text style={[styles.itemValue, styles.completedTasks]}>
              {getCompletedTasks()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Progreso</Text>
          <View style={styles.progressCard}>
            {getTotalTasks() > 0 ? (
              <>
                <Text style={styles.progressText}>
                  Has completado {getCompletedTasks()} de {getTotalTasks()}{" "}
                  tareas
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (getCompletedTasks() / getTotalTasks()) * 100
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercentage}>
                  {Math.round((getCompletedTasks() / getTotalTasks()) * 100)}%
                  completado
                </Text>
              </>
            ) : (
              <Text style={styles.noTasksText}>
                ¡Crea tu primer proyecto y agrega tareas para ver tu progreso!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60, // Manual padding para safe area
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    color: "#1f2937",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#374151",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  itemLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  itemValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  pendingTasks: {
    color: "#f59e0b",
  },
  inProgressTasks: {
    color: "#3b82f6",
  },
  completedTasks: {
    color: "#10b981",
  },
  progressCard: {
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10b981",
  },
  noTasksText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    fontStyle: "italic",
  },
});
