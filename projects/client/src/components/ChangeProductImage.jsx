import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  FormControl,
  FormErrorMessage,
  Image,
  Flex,
  Box,
  Input,
  FormLabel,
} from "@chakra-ui/react";

const ChangeProductImage = ({
  isOpen,
  onClose,
  categoryId,
  onProductUpdate,
}) => {
  const toast = useToast();
  const [localImage, setLocalImage] = useState("");

  const formik = useFormik({
    initialValues: {
      imageUrl: null,
    },
    validationSchema: Yup.object({
      imageUrl: Yup.mixed()
        .test("fileType", "Invalid image format", (value) => {
          if (value && value.length) {
            const fileType = value[0].type;
            return (
              fileType === "image/png" ||
              fileType === "image/jpg" ||
              fileType === "image/jpeg"
            );
          }
          return true;
        })
        .required("Image is required"),
    }),
    onSubmit: async (values) => {
      try {
        await patchProductImage(values);
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

  const patchProductImage = async (values) => {
    try {
      const formData = new FormData();
      if (values.imageUrl) {
        formData.append("imageUrl", values.imageUrl[0]);
      }

      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/product/patchproductImage/${categoryId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onClose();
      formik.resetForm();
      onProductUpdate();
      toast({
        title: `Image updated successfully`,
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

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        setLocalImage(e.target.result);
      };

      reader.readAsDataURL(file);
      formik.setFieldValue("imageUrl", event.currentTarget.files);
    } else {
      formik.setFieldValue("imageUrl", null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change Product Image</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={formik.handleSubmit}>
            <FormControl
              isInvalid={formik.touched.imageUrl && formik.errors.imageUrl}
            >
              <FormLabel>Select a new product image:</FormLabel>
              <Flex>
                <Box>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      formik.setFieldValue(
                        "imageUrl",
                        event.currentTarget.files
                      );
                      handleImageChange(event);
                    }}
                  />
                  {localImage && (
                    <Box mt={2}>
                      <Image
                        src={localImage}
                        alt="product"
                        objectFit="contain"
                        w="100%"
                        maxH="200px"
                      />
                    </Box>
                  )}
                  <FormErrorMessage>{formik.errors.imageUrl}</FormErrorMessage>
                </Box>
              </Flex>
            </FormControl>
            <Button type="submit" mt={4}>
              Upload
            </Button>
            <Button
              onClick={() => {
                onClose();
                setLocalImage("");
              }}
              mt={4}
              ml={2}
            >
              Cancel
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ChangeProductImage;
