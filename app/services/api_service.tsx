import axios from "axios";
import { updateTaskCompleted } from "../services/db_service";
import Constants from "expo-constants";

const PAS_API_URL = Constants.expoConfig?.extra.PAS_URL;
const PAS_API_TOKEN = Constants.expoConfig?.extra.PAS_Token;

export const sendPassiveAssignmentRequest = async (
  uid,
  todo_id,
  task_id,
  task_description,
  from_name,
  asignee_name,
  asignee_email
) => {
  const requestBody = {
    uid: uid,
    todo_id: todo_id,
    task_id: task_id,
    assignment: task_description,
    from_name: from_name,
    to_name: asignee_name,
    to_email: asignee_email,
  };
  try {
    console.log("Sending passive assignment request:", requestBody);
    // Send the request
    const response = await axios.post(PAS_API_URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAS_API_TOKEN}`,
      },
    });

    console.log("Passive assignment request sent:", response.data);
    return response.data;
  } catch (error) {
    console.log("Error sending passive assignment request:", error);
    throw error;
  }
};

export const checkPassiveAssignmentCompletion = async (
  uid,
  todo_id,
  task_id
) => {
  try {
    console.log("Checking passive assignment completion:");
    // Send the request
    const url = `${PAS_API_URL}/${uid}/${todo_id}/${task_id}/status`;
    console.log("url: ", url);
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAS_API_TOKEN}`,
      },
    });

    console.log("Passive assignment completion checked:", response.data);

    // Update database with the completion status
    updateTaskCompleted(task_id, response.data.is_completed ? 1 : 0)
      .then(() => {
        console.log("Task completion status updated in database");
      })
      .catch((error) => {
        console.log(
          "Error updating task completion status in database:",
          error
        );
      });

    return response.data;
  } catch (error) {
    console.log("Error checking passive assignment completion:", error);
    throw error;
  }
};
