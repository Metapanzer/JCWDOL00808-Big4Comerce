import { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  useToast,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Button,
  Box,
  FormErrorMessage,
  Select,
  Modal,
  ModalOverlay,
  Spinner,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import AddProductConfirmation from "./AddConfirmation";
import ChangeProductImage from "./ChangeProductImage";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Product Name is required"),
  description: Yup.string().required("Product Description is required"),
  price: Yup.number()
    .min(0, "Price must be greater than or equal to 0")
    .required("Price is required"),
  weight: Yup.number()
    .min(0, "Weight must be greater than or equal to 0")
    .required("Weight must be filled"),
  product_categories_id: Yup.number()
    .min(1, "Please select a product category")
    .required("Product Category is required"),
});

const PatchProductModal = ({
  isOpen,
  onClose,
  categoryId,
  onProductUpdate,
}) => {
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const id = categoryId;
  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      price: 0,
      weight: 0,
      product_categories_id: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);

      try {
        const data = {
          name: values.name,
          description: values.description,
          price: values.price,
          weight: values.weight,
        };

        await axios.patch(
          `${process.env.REACT_APP_API_BASE_URL}/product/patchproduct/${id}`,
          data
        );
        setIsSubmitting(false);
        formik.resetForm();
        onClose();
        onProductUpdate();
        toast({
          title: `Edit Product Success`,
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } catch (error) {
        console.log(error);
        setIsSubmitting(false);
        toast({
          title: `${error.response.data.message}`,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchProductData();
  }, [categoryId]);

  const fetchCategories = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/productcategory/listproductcategory`
    );
    setCategories(response.data.result);
  };

  const fetchProductData = async () => {
    if (!categoryId) {
      onClose();
      return;
    }

    try {
      setIsLoading(true); // set loading state
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/product/productId/${id}`
      );
      const productData = response.data;
      formik.setValues({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        weight: productData.weight,
        product_categories_id: productData.product_categories_id,
      });
      setIsLoading(false); // clear loading state
    } catch (error) {
      setIsLoading(false); // clear loading state
      toast({
        title: `${error.response.data.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
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
          <ModalHeader>Update Product</ModalHeader>
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
                <form
                  onSubmit={formik.handleSubmit}
                  style={{ margin: "auto", width: "100%" }}
                >
                  <FormControl
                    mb={2}
                    mt="2"
                    id="name"
                    isInvalid={formik.touched.name && formik.errors.name}
                  >
                    <FormLabel>Product Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="Input Product Name"
                      {...formik.getFieldProps("name")}
                    />
                    <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    mb={2}
                    id="product_categories_id"
                    isInvalid={
                      formik.touched.product_categories_id &&
                      formik.errors.product_categories_id
                    }
                  >
                    <FormLabel>Product Category</FormLabel>
                    <Select
                      placeholder="Select Product Category"
                      {...formik.getFieldProps("product_categories_id")}
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>
                      {formik.errors.product_categories_id}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    mb={2}
                    id="description"
                    isInvalid={
                      formik.touched.description && formik.errors.description
                    }
                  >
                    <FormLabel>Product Description</FormLabel>
                    <Textarea
                      placeholder="Input Product Description"
                      {...formik.getFieldProps("description")}
                    />
                    <FormErrorMessage>
                      {formik.errors.description}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    mb={2}
                    id="price"
                    isInvalid={formik.touched.price && formik.errors.price}
                  >
                    <FormLabel>Price</FormLabel>
                    <NumberInput
                      min={0}
                      {...formik.getFieldProps("price")}
                      onChange={(value) => formik.setFieldValue("price", value)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{formik.errors.price}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    mb={2}
                    id="weight"
                    isInvalid={formik.touched.weight && formik.errors.weight}
                  >
                    <FormLabel>Weight (in gram)</FormLabel>
                    <NumberInput
                      min={0}
                      {...formik.getFieldProps("weight")}
                      onChange={(value) =>
                        formik.setFieldValue("weight", value)
                      }
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{formik.errors.weight}</FormErrorMessage>
                  </FormControl>

                  {/* <FormControl mb={2} id="imageUrl" isInvalid={formik.touched.imageUrl && formik.errors.imageUrl}>
                  <FormLabel>Image Product</FormLabel>
                  <Flex>
                    <Box w={16} h={16} mr={4}>
                      {image && <Image src={image.startsWith("data:") ? image : `http://localhost:8000/${image}`} alt="Produk" />}
                    </Box>
                    <Box>
                      <Input type="file" accept="image/*" onChange={handleImageChange} />
                      <FormErrorMessage>{formik.errors.imageUrl}</FormErrorMessage>
                    </Box>
                  </Flex>
                </FormControl> */}

                  <Button onClick={openChangeImageModal}>
                    Change Product Image
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

                    <AddProductConfirmation
                      onSave={formik.handleSubmit}
                      isLoading={isSubmitting}
                    />
                  </Flex>
                </form>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal for change product Image */}
      <ChangeProductImage
        isOpen={isChangeImageModalOpen}
        onClose={closeChangeImageModal}
        categoryId={categoryId}
        onProductUpdate={onProductUpdate}
      />
    </>
  );
};

export default PatchProductModal;
