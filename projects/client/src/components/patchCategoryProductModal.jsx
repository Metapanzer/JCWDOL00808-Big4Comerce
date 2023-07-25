import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  Spinner,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  useToast,
  FormErrorMessage,
  Flex,
  Button,
} from "@chakra-ui/react";
import axios from "axios";
import AddCategoryConfirmation from "./AddConfirmation";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const PatchCategoryProduct = ({
  isOpen,
  onClose,
  categoryId,
  onCategoryUpdate,
}) => {
  const toast = useToast();
  const id = categoryId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Category Name is required"),
      description: Yup.string().required("Description is required"),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        await patchCategory(values);
        setIsSubmitting(false);
      } catch (error) {
        setIsSubmitting(false);
        toast({
          title: `${error.message}`,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    },
  });

  const fetchCategoryData = async () => {
    if (!categoryId) {
      onClose();
      return;
    }

    setIsLoading(true); // set loading state
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/productcategory/productcategory/${id}`
      );
      const categoryData = response.data;

      formik.setValues({
        name: categoryData.name,
        description: categoryData.description,
      });
      setIsLoading(false); // clear loading state
    } catch (error) {
      setIsLoading(false); // clear loading state
      toast({
        title: `${error.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const patchCategory = async (values) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/productcategory/patchcategoryproduct/${id}`,
        values
      );

      toast({
        title: `Edit Category Success`,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      onCategoryUpdate();
      onClose();
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
    fetchCategoryData();
  }, [categoryId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Category</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Flex justify="center" align="center" h="200px">
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            </Flex>
          ) : (
            <Box w="100%" maxW="600px" mx="auto" my="auto" mt="3" mb="10">
              <form onSubmit={formik.handleSubmit}>
                <VStack spacing="1" align="stretch">
                  <FormControl
                    id="name"
                    isRequired
                    isInvalid={formik.touched.name && formik.errors.name}
                  >
                    <FormLabel>Category Name</FormLabel>
                    <Input
                      type="text"
                      {...formik.getFieldProps("name")}
                      placeholder="Input Category"
                    />
                    <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    id="description"
                    isRequired
                    isInvalid={
                      formik.touched.description && formik.errors.description
                    }
                  >
                    <FormLabel>Description</FormLabel>
                    <Input
                      type="text"
                      {...formik.getFieldProps("description")}
                      placeholder="Input Description"
                    />
                    <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
                  </FormControl>

                  {/* button for cancel and submit */}
                  <Flex justifyContent="flex-end">
                    <Button
                      variant="ghost"
                      mr={1}
                      onClick={() => {
                        onClose();
                        //   formik.resetForm();
                      }}
                    >
                      Cancel
                    </Button>

                    <AddCategoryConfirmation
                      onSave={formik.handleSubmit}
                      isLoading={isSubmitting}
                    />
                  </Flex>
                </VStack>
              </form>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PatchCategoryProduct;
