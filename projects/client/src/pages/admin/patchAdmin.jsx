import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  VStack,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import axios from "axios";
import AddAdminConfirmation from "../../components/AddConfirmation";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";

const PatchAdmin = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const formik = useFormik({
    initialValues: {
      full_name: "",
      email: "",
      password: "",
      phone_number: "",
      role: "",
      image: null,
    },
    validationSchema: Yup.object({
      full_name: Yup.string().required("Full Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must have 8 character")
        .required("Password is required"),
      phone_number: Yup.string().required("Phone Number is required"),
      role: Yup.string().required("Role is required"),
      image: Yup.mixed().required("Image is required"),
    }),
    onSubmit: async (values) => {
      try {
        await patchAdmin(values);
      } catch (error) {
        toast({
          title: `${error.message}`,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    },
  });

  const fetchAdminData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admin/getAdminById/${id}`
      );
      const adminData = response.data;
      // console.log(response);
      formik.setValues({
        full_name: adminData.full_name,
        email: adminData.email,
        password: adminData.password,
        phone_number: adminData.phone_number,
        role: adminData.role.toString(),
        image: null,
      });
    } catch (error) {
      toast({
        title: `${error.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const patchAdmin = async (values) => {
    try {
      const formData = new FormData();
      formData.append("full_name", values.full_name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("phone_number", values.phone_number);
      formData.append("role", values.role);
      if (values.image) {
        formData.append("profile_picture", values.image);
      }

      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/admin/patchAdmin/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: `Edit Admin Success`,
        status: "success",
        duration: 9000,
        isClosable: true,
      });

      navigate("/admin/ManageAdmin");
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
  }, []);

  return (
    <Box w="100%" maxW="600px" mx="auto" my="auto" mt="3" mb="10">
      <Text fontSize="xl" fontWeight="bold" mb="4">
        Edit Admin
      </Text>
      <form onSubmit={formik.handleSubmit}>
        <VStack spacing="1" align="stretch">
          <FormControl
            id="fullName"
            isRequired
            isInvalid={formik.touched.full_name && formik.errors.full_name}
          >
            <FormLabel>Full Name</FormLabel>
            <Input
              type="text"
              {...formik.getFieldProps("full_name")}
              placeholder="Input Admin Full Name"
            />
            <FormErrorMessage>{formik.errors.full_name}</FormErrorMessage>
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
            id="password"
            isRequired
            isInvalid={formik.touched.password && formik.errors.password}
          >
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              {...formik.getFieldProps("password")}
              placeholder="Input Admin Password"
            />
            <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
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
            <FormErrorMessage>{formik.errors.phone_number}</FormErrorMessage>
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

          <FormControl
            id="image"
            isRequired
            isInvalid={formik.touched.image && formik.errors.image}
          >
            <FormLabel>Profile Image</FormLabel>
            <Input
              type="file"
              onChange={(event) =>
                formik.setFieldValue("image", event.target.files[0])
              }
            />
            <FormErrorMessage>{formik.errors.image}</FormErrorMessage>
          </FormControl>

          <AddAdminConfirmation onSave={formik.handleSubmit} />
        </VStack>
      </form>
    </Box>
  );
};

export default PatchAdmin;
