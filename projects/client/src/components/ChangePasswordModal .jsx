import {
  Modal,
  ModalOverlay,
  useToast,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import AddAdminConfirmation from "./AddConfirmation";

const ChangePasswordModal = ({ isOpen, onClose, adminId }) => {
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      password: "",
      confirm_new_password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, "Password must have 8 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
          "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
        )
        .required("New password is required"),
      confirm_new_password: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm new password is required"),
    }),
    onSubmit: async (values) => {
      // Handle password change
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_BASE_URL}/admin/changePassword/${adminId}`,
          {
            password: values.password,
          }
        );

        if (response.status === 200) {
          toast({
            title: "Password updated successfully",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Failed to update password",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: "Error occurred while updating password",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }

      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change Password</ModalHeader>
        <ModalCloseButton onClick={handleClose} />
        <ModalBody>
          <form onSubmit={formik.handleSubmit}>
            <VStack spacing="1" align="stretch">
              <FormControl
                id="password"
                isRequired
                isInvalid={formik.touched.password && formik.errors.password}
              >
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  {...formik.getFieldProps("password")}
                  placeholder="Input new password"
                />
                <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
              </FormControl>

              <FormControl
                id="confirm_new_password"
                isRequired
                isInvalid={
                  formik.touched.confirm_new_password &&
                  formik.errors.confirm_new_password
                }
              >
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  {...formik.getFieldProps("confirm_new_password")}
                  placeholder="Confirm new password"
                />
                <FormErrorMessage>
                  {formik.errors.confirm_new_password}
                </FormErrorMessage>
              </FormControl>

              <AddAdminConfirmation onSave={formik.handleSubmit} />
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ChangePasswordModal;
