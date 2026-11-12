// Lets plain HTTP routes ask whether the owner is connected to the live-chat console.
let check: () => boolean = () => false;
export const setAgentOnlineCheck = (fn: () => boolean) => {
  check = fn;
};
export const isAgentOnline = (): boolean => check();
