import { createContext, useContext } from "react";

export const TaskActionContext = createContext({
  triggerEdit: () => {},
  triggerDelete: () => {},
});

export function useTaskAction() {
  return useContext(TaskActionContext);
}
