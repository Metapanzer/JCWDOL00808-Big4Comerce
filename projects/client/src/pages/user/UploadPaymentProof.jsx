import { Box, Text, Input, Button, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const UploadPaymentProof = () => {
  const [proof, setProof] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  let token = localStorage.getItem("user_token");
  let { search } = useLocation();
  let orders_id = parseInt(search.split("=")[1]);

  const handleUploadButton = async () => {
    const formData = new FormData();
    formData.append("payment_proof", proof);
    formData.append("id", orders_id);

    await Axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/orders/upload-payment-proof`,
      formData,
      {
        headers: { Authorization: token },
      }
    )
      .then((response) => {
        toast({
          title: `${response.data.message}`,
          duration: 9000,
          isClosable: true,
        });
        setTimeout(
          () => (navigate("/user/order-list", { replace: true }), 2000)
        );
      })
      .catch((error) => {
        console.log(error);
        toast({
          title: `File must be an image format.`,
          duration: 9000,
          isClosable: true,
        });
      });
  };

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <Box w={[300, 400, 500]} className="shadow p-5">
        <Text fontSize="2xl" className="font-[Oswald]">
          Upload proof for payment
        </Text>
        <Text className="mt-3" fontSize="md">
          Please upload using the image format (JPG, JPEG, PNG)
        </Text>
        <Input
          mt="1.5"
          type="file"
          placeholder="upload .jpeg/ .jpg/ .png file less than 5MB"
          onChange={(element) => setProof(element.target.files[0])}
        />

        <Button
          onClick={handleUploadButton}
          variant="buttonBlack"
          className="mt-6 w-full rounded-md bg-blue-500 py-1.5 font-medium text-blue-50 hover:bg-blue-600"
        >
          Upload
        </Button>
        <Button
          onClick={() => navigate("/user/order-list")}
          variant="buttonWhite"
          className="mt-6 w-full rounded-md bg-blue-500 py-1.5 font-medium text-blue-50 hover:bg-blue-600"
        >
          Back to transaction list
        </Button>
      </Box>
    </div>
  );
};

export default UploadPaymentProof;
