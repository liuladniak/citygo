// import { useState } from "react";
// import Button from "../ui/CustomButton/CustomButton";
// import Modal from "../ui/Modal";
// import Icon from "../ui/SVGIcons/Icon";
// import {
//   addPath,
//   calenderIconPath,
//   checkCirclePath,
//   clockPath,
//   errorPath,
//   groupIconPath,
//   phonePath,
//   questionPath,
// } from "../ui/SVGIcons/iconPaths";

// interface Task {
//   id: string;
//   taskIcon: string;
//   taskHeading: string;
//   taskBody: string;
//   priority: "high" | "medium" | "low";
//   when: string;
//   completedStatus: boolean;
// }

// const getPriorityStyles = (priority) => {
//   switch (priority) {
//     case "high":
//       return {
//         bg: "bg-red-100",
//         text: "text-red-800",
//         icon: errorPath,
//         label: "High",
//       };
//     case "medium":
//       return {
//         bg: "bg-yellow-100",
//         text: "text-yellow-800",
//         icon: clockPath,
//         label: "Medium",
//       };
//     case "low":
//       return {
//         bg: "bg-green-100",
//         text: "text-green-800",
//         icon: checkCirclePath,
//         label: "Low",
//       };
//     default:
//       return {
//         bg: "bg-gray-100",
//         text: "text-gray-800",
//         icon: questionPath,
//         label: "Unknown",
//       };
//   }
// };

// const tasksArray = [
//   {
//     taskIcon: phonePath,
//     taskHeading: "Follow up with Johnson family",
//     taskBody: "Confirm tour details for next week",
//     priority: "high",
//     when: "Today",
//     completedStatus: false,
//   },
//   {
//     taskIcon: calenderIconPath,
//     taskHeading: "Prepare Golden Gate tour itinerary",
//     taskBody: "Create detailed schedule for 15-person group",
//     priority: "medium",
//     when: "Tomorrow",
//     completedStatus: false,
//   },
//   {
//     taskIcon: groupIconPath,
//     taskHeading: "Update client preferences",
//     taskBody: "Add dietary restrictions to Thompson booking",
//     priority: "low",
//     when: "This week",
//     completedStatus: false,
//   },
//   {
//     taskIcon: clockPath,
//     taskHeading: "Confirm tour guide availability",
//     taskBody: "Check Sarah's schedule for weekend tours",
//     priority: "medium",
//     when: "Today",
//     completedStatus: false,
//   },
// ];

// const MyTasks = () => {
//   const [tasks, setTasks] = useState<Task[]>(tasksArray);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [newTask, setNewTask] = useState<Omit<Task, "id">>({
//     taskIcon: questionPath,
//     taskHeading: "",
//     taskBody: "",
//     priority: "low",
//     when: "Today",
//     completedStatus: false,
//   });

//   const handleAddTask = () => {
//     if (!newTask.taskHeading.trim()) return;

//     const task: Task = {
//       id: Date.now(),
//       ...newTask,
//     };

//     setTasks((prev) => [...prev, task]);
//     setNewTask({
//       taskIcon: questionPath,
//       taskHeading: "",
//       taskBody: "",
//       priority: "low",
//       when: "Today",
//       completedStatus: false,
//     });
//     setIsModalOpen(false);
//   };

//   return (
//     <div className="flex-1 rounded-lg border  shadow-xs bg-white border-slate-200">
//       <div className="p-6 flex flex-row items-center justify-between pb-4">
//         <h3 className="tracking-tight text-lg font-semibold text-slate-900 ">
//           My Tasks
//         </h3>
//         <Button
//           onClick={() => setIsModalOpen(true)}
//           IconPath={addPath}
//           className="text-warm-brown"
//         >
//           Add Task
//         </Button>
//         <Modal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           title="Add New Task"
//         >
//           <div className="space-y-4">
//             <input
//               type="text"
//               placeholder="Task title"
//               value={newTask.taskHeading}
//               onChange={(e) =>
//                 setNewTask((prev) => ({ ...prev, taskHeading: e.target.value }))
//               }
//               className="w-full px-3 py-2 border rounded-sm"
//             />
//             <textarea
//               placeholder="Task description"
//               value={newTask.taskBody}
//               onChange={(e) =>
//                 setNewTask((prev) => ({ ...prev, taskBody: e.target.value }))
//               }
//               className="w-full px-3 py-2 border rounded-sm"
//             />
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="px-4 py-2 border rounded-sm hover:bg-gray-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAddTask}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
//               >
//                 Add Task
//               </button>
//             </div>
//           </div>
//         </Modal>
//       </div>
//       <div className="p-6 pt-0 space-y-3">
//         {tasks.map((task, i) => (
//           <MyTask
//             key={i}
//             taskIcon={task.taskIcon}
//             taskHeading={task.taskHeading}
//             taskBody={task.taskBody}
//             priority={task.priority}
//             when={task.when}
//             completedStatus={task.completedStatus}
//           />
//         ))}

//         <div className="pt-2 border-t border-slate-200">
//           <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2  focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 rounded-md px-3 w-full text-warm-brown hover:text-travel-blue-700 hover:bg-travel-blue-50">
//             View All Tasks
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyTasks;

// const MyTask = ({
//   taskIcon,
//   taskHeading,
//   taskBody,
//   priority,
//   when,
//   completedStatus,
// }) => {
//   const priorityStyles = getPriorityStyles(priority);
//   return (
//     <div className="flex flex-1 items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
//       <Icon iconPath={taskIcon} />
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2 mb-1">
//           <h4 className="text-sm font-medium text-slate-900 truncate">
//             {taskHeading}
//           </h4>
//           {/* <div className="inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 border-transparent hover:bg-secondary/80 text-xs px-2 py-0.5 bg-red-100 text-red-800">
//             <div className="flex items-center gap-1 ">
//               <Icon iconPath={errorPath} size={12} />
//               high
//             </div>
//           </div> */}

//           <div
//             className={`inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 border-transparent hover:bg-secondary/80 text-xs px-2 py-0.4 ${priorityStyles.bg} ${priorityStyles.text}`}
//           >
//             <div className="flex items-center gap-1">
//               <Icon iconPath={priorityStyles.icon} size={12} />
//               <span className="mt-0.5">{priorityStyles.label}</span>
//             </div>
//           </div>
//         </div>
//         <p className="text-xs text-slate-600 mb-2">{taskBody}</p>
//         <div className="flex items-center justify-between">
//           <span className="text-xs text-slate-500">{when}</span>
//           <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground rounded-md h-6 text-xs px-2 text-warm-brown">
//             Mark Done
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

const MyTasks = () => {
  return <div>MyTasks</div>;
};

export default MyTasks;
