import React from "react";
import {
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";

function LogoutDialog({ onLogout, isOpen, onClose }) {
  const cancelRef = React.useRef();

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <>
      {/* <Button variant="outline" colorScheme="red" onClick={onOpen}>
        Logout
      </Button> */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Logout
          </AlertDialogHeader>
          <AlertDialogBody>Are you sure you want to logout?</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <button
              class="bg-dark-purple hover:bg-blue-700 text-white font-bold py-2 px-4 ml-3 rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default LogoutDialog;
