import { Input, InputGroup, InputRightElement, Box, Button, useToast, FormControl, FormLabel, FormErrorMessage, Stack, Heading } from "@chakra-ui/react";
import React from "react";
import { useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

const AdminLogin = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const navigate = useNavigate();

  const toast = useToast();

  const loginButton = (values) => {
    Axios.post(`${process.env.REACT_APP_API_BASE_URL}/admins/login`, {
      email: values.email,
      password: values.password,
    })
      .then((response) => {
        if (response.data.success) {

          let a = JSON.stringify(response?.data?.data);
          let b = JSON.parse(a);

          localStorage.setItem("token", b.token);
          localStorage.setItem("role", b.role);

          toast({
            title: `${response.data.message}`,
            status: "success",
            duration: 9000,
            isClosable: true,
          });
          setTimeout(() => (navigate("/admin/dashboard", { replace: true }), 2000));
        } else {
          toast({
            title: `${response.data.message}`,
            duration: 9000,
            isClosable: true,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toast({
          title: `${error.message}`,
          duration: 9000,
          isClosable: true,
        });
      });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: yup.object().shape({
      email: yup.string().required("E-mail address is required").email(),
      password: yup.string().required("Password is required"),
    }),
    onSubmit: (values, actions) => {
      loginButton(values);
      actions.resetForm();
    },
  });

  return (
    <>
      <div className="flex justify-center items-center h-screen w-full">
        <Box w={[300, 400, 500]} className="shadow p-5">
          <Stack align={"center"}>
            <Heading fontSize={"4xl"} textAlign={"center"} fontFamily={"Oswald"}>
              Login as admin
            </Heading>
          </Stack>
          <form onSubmit={formik.handleSubmit}>
            <FormControl isInvalid={formik.errors.email && formik.touched.email}>
              <FormLabel>E-mail address</FormLabel>
              <Input id="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={formik.errors.password && formik.touched.password}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input id="password" value={formik.values.password} onChange={formik.handleChange} type={show ? "text" : "password"} onBlur={formik.handleBlur} />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
            </FormControl>
            <Button type="submit" variant="buttonBlack" className="mt-6 w-full rounded-md bg-blue-500 py-1.5 font-medium text-blue-50 hover:bg-blue-600">
              Login
            </Button>
          </form>
          <Button variant="subtle" colorScheme="gray" type="submit" onClick={() => navigate("/user/login")}>
            Login as user
          </Button>
        </Box>
      </div>
    </>
  );
};

export default AdminLogin;
