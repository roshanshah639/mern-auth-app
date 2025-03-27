import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedUser: null,
};

const selectedUser = createSlice({
  name: "selectedUser",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    removeSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
});

export const { setSelectedUser, removeSelectedUser } = selectedUser.actions;
export default selectedUser.reducer;
