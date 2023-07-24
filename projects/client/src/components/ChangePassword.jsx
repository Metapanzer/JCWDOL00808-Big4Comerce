import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { sessionExpired } from "../apis/userAPIs";
import ChangePasswordConfirmation from "./ChangePasswordConfirmation";
import { userLogout } from "../reducers/authSlice";

export default function ChangePassword(props) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();

  const handleChangePassword = async (values) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("user_token");
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/user/profile/password`,
        values,
        {
          headers: { Authorization: token },
        }
      );
      setIsLoading(false);
      toast({
        title: response?.data?.message,
        description: "Please login after changing password.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setTimeout(() => {
        dispatch(userLogout());
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      if (error.response.status === 401) {
        toast({
          title: error?.response?.data?.message || error?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setTimeout(() => {
          sessionExpired();
        }, 1000);
      } else {
        toast({
          title: error?.response?.data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Old password is required"),
    newPassword: Yup.string()
      .matches(/^(?=.*[A-Z])/, "Must contain at least one uppercase")
      .matches(/^(?=.*[a-z])/, "Must contain at least one lowercase")
      .matches(/^(?=.*[0-9])/, "Must contain at least one number")
      .matches(
        /^(?=.*[!@#$%^&*])/,
        "Must contain at least one special character"
      )
      .min(8, "Password minimum 8 character")
      .required("New password is required!"),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref("newPassword"), null],
      "Passwords must match"
    ),
  });

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleChangePassword(values);
    },
  });

  return (
    <>
      <Heading
        fontFamily="Oswald"
        lineHeight={1.1}
        fontSize={{ base: "2xl", sm: "3xl" }}
      >
        Change password
      </Heading>
      <FormControl
        id="oldPassword"
        isRequired
        isInvalid={formik.touched.oldPassword && formik.errors.oldPassword}
      >
        <FormLabel fontFamily="Oswald">Old Password</FormLabel>
        <InputGroup>
          <Input
            ontFamily="Roboto"
            borderRadius={0}
            id="oldPassword"
            name="oldPassword"
            placeholder="Old Password"
            type={showOldPassword ? "text" : "password"}
            onChange={formik.handleChange}
            value={formik.values.oldPassword}
          />
          <InputRightElement h={"full"}>
            <Button
              variant={"ghost"}
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? <ViewIcon /> : <ViewOffIcon />}
            </Button>
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{formik.errors.oldPassword}</FormErrorMessage>
      </FormControl>
      <FormControl
        id="newPassword"
        isRequired
        isInvalid={formik.touched.newPassword && formik.errors.newPassword}
      >
        <FormLabel fontFamily="Oswald">New Password</FormLabel>
        <InputGroup>
          <Input
            ontFamily="Roboto"
            borderRadius={0}
            id="newPassword"
            name="newPassword"
            placeholder="New Password"
            type={showNewPassword ? "text" : "password"}
            onChange={formik.handleChange}
            value={formik.values.newPassword}
          />
          <InputRightElement h={"full"}>
            <Button
              variant={"ghost"}
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <ViewIcon /> : <ViewOffIcon />}
            </Button>
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{formik.errors.newPassword}</FormErrorMessage>
      </FormControl>
      <FormControl
        id="confirmPassword"
        isRequired
        isInvalid={
          formik.touched.confirmPassword && formik.errors.confirmPassword
        }
      >
        <FormLabel fontFamily="Oswald">Confirm New Password</FormLabel>
        <InputGroup>
          <Input
            ontFamily="Roboto"
            borderRadius={0}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            onChange={formik.handleChange}
            value={formik.values.confirmPassword}
          />
          <InputRightElement h={"full"}>
            <Button
              variant={"ghost"}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <ViewIcon /> : <ViewOffIcon />}
            </Button>
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{formik.errors.confirmPassword}</FormErrorMessage>
      </FormControl>
      <Stack spacing={6} direction={["column", "row"]}>
        <Button onClick={props.onCancel} w="full" variant="buttonWhite">
          Cancel
        </Button>
        <ChangePasswordConfirmation
          isLoading={isLoading}
          onSave={() => formik.handleSubmit()}
        />
      </Stack>
    </>
  );
}
