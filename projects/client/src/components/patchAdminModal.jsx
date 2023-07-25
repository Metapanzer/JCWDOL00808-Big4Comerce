import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  FormErrorMessage,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import AddAdminConfirmation from "./AddConfirmation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";
import { useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal ";
import ChangeImageModal from "./ChangeProfilePictureModal";

const PatchAdminModal = ({ isOpen, onClose, adminId, onAdminPatch }) => {
  const toast = useToast();
  const id = adminId;
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      full_name: "",
      email: "",
      phone_number: "",
      role: "",
    },
    validationSchema: Yup.object({
      full_name: Yup.string().required("Full Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      phone_number: Yup.string().required("Phone Number is required"),
      role: Yup.string().required("Role is required"),
    }),
    onSubmit: async (values) => {
      try {
        await patchAdmin(values);
      } catch (error) {
        toast({
          title: `${error.response.data.message}`,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    },
  });

  const fetchAdminData = async () => {
    if (!adminId) {
      onClose();
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admin/getAdminById/${id}`
      );
      const adminData = response.data;
      formik.setValues({
        full_name: adminData.full_name,
        email: adminData.email,
        phone_number: adminData.phone_number,
        role: adminData.role.toString(),
      });
    } catch (error) {
      toast({
        title: `${error.response.data.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const patchAdmin = async (values) => {
    try {
      const data = {
        full_name: values.full_name,
        email: values.email,
        phone_number: values.phone_number,
        role: values.role,
      };

      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/admin/patchAdmin/${id}`,
        data
      );
      onClose();
      formik.resetForm();
      onAdminPatch();
      toast({
        title: `Edit Admin Success`,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: `${error.response.data.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [adminId]);

  const openChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  const openChangeImageModal = () => {
    setIsChangeImageModalOpen(true);
  };

  const closeChangeImageModal = () => {
    setIsChangeImageModalOpen(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Data Admin</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="100%" maxW="600px" mx="auto" my="auto" mt="3" mb="10">
              <form onSubmit={formik.handleSubmit}>
                <VStack spacing="4" align="stretch">
                  <FormControl
                    id="fullName"
                    isRequired
                    isInvalid={
                      formik.touched.full_name && formik.errors.full_name
                    }
                  >
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      type="text"
                      {...formik.getFieldProps("full_name")}
                      placeholder="Input Admin Full Name"
                    />
                    <FormErrorMessage>
                      {formik.errors.full_name}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    id="email"
                    isRequired
                    isInvalid={formik.touched.email && formik.errors.email}
                  >
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      {...formik.getFieldProps("email")}
                      placeholder="Input Admin Email"
                    />
                    <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    id="phoneNumber"
                    isRequired
                    isInvalid={
                      formik.touched.phone_number && formik.errors.phone_number
                    }
                  >
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      type="tel"
                      {...formik.getFieldProps("phone_number")}
                      placeholder="Input Phone Number"
                    />
                    <FormErrorMessage>
                      {formik.errors.phone_number}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    id="role"
                    isRequired
                    isInvalid={formik.touched.role && formik.errors.role}
                  >
                    <FormLabel>Role</FormLabel>
                    <Select
                      placeholder="Choose Admin Role"
                      {...formik.getFieldProps("role")}
                    >
                      {[
                        { value: "1", label: "Admin" },
                        { value: "2", label: "Admin Warehouse" },
                      ].map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{formik.errors.role}</FormErrorMessage>
                  </FormControl>

                  {/* <FormControl mb={2} id="profile_picture" isInvalid={formik.touched.profile_picture && formik.errors.profile_picture}>
                    <FormLabel>Profile Picture</FormLabel>
                    <Flex>
                      <Box w={16} h={16} mr={4}>
                        {image && <Image src={image.startsWith("data:") ? image : `http://localhost:8000/${image}`} alt="Produk" />}
                      </Box>
                      <Box>
                        <Input type="file" accept="image/*" onChange={handleImageChange} />
                        <FormErrorMessage>{formik.errors.profile_picture}</FormErrorMessage>
                      </Box>
                    </Flex>
                  </FormControl> */}

                  <Button onClick={openChangeImageModal}>
                    Change Profile Picture
                  </Button>

                  <Button onClick={openChangePasswordModal}>
                    Change Password
                  </Button>

                  {/* button for cancel and submit */}
                  <Flex justifyContent="flex-end">
                    <Button
                      variant="ghost"
                      mr={1}
                      onClick={() => {
                        onClose();
                      }}
                    >
                      Cancel
                    </Button>
                    <AddAdminConfirmation onSave={formik.handleSubmit} />
                  </Flex>
                </VStack>
              </form>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal for change password and change profile_picture */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={closeChangePasswordModal}
        adminId={adminId}
      />
      <ChangeImageModal
        isOpen={isChangeImageModalOpen}
        onClose={closeChangeImageModal}
        adminId={adminId}
        onAdminPatch={onAdminPatch}
      />
    </>
  );
};

export default PatchAdminModal;
