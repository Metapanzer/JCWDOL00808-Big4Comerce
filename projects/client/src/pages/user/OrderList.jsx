import {
  Button,
  Badge,
  Text,
  Flex,
  Divider,
  Box,
  Select,
  Image,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import React from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { format } from "date-fns";

const OrderList = () => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState("DESC");
  const [dataDetails, setDataDetails] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [statusModal, setStatusModal] = useState("");
  const [grand_total, setGrand_total] = useState(0);
  const [weight, setWeight] = useState(0);
  const [shipping_cost, setShipping_cost] = useState(0);
  const [shipping_method, setShipping_method] = useState(0);
  const [total_price, setTotal_price] = useState(0);
  const [idToCancel, setIdToCancel] = useState(0);

  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const cancelRef = React.useRef();

  let token = localStorage.getItem("user_token");
  const getTransactionList = async () => {
    await Axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/orders/getOrderList?page=${page}&order=${order}&status=${status}`,
      {
        headers: { Authorization: token },
      }
    )
      .then((response) => {
        setTotalPage(response.data.totalPage);
        setList(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getTransactionList();
  }, [page, order, status]);

  const handleCancelButton = (value) => {
    Axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/orders/cancelOrder`,
      {
        id: value,
      },
      {
        headers: { Authorization: token },
      }
    )
      .then((response) => {
        toast({
          title: `${response.data.message}`,
          duration: 9000,
          isClosable: true,
          onCloseComplete: () => window.location.reload(false),
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleConfirmButton = (value) => {
    Axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/orders/confirmDelivery`,
      {
        id: value,
      },
      {
        headers: { Authorization: token },
      }
    )
      .then((response) => {
        toast({
          title: `${response.data.message}`,
          duration: 9000,
          isClosable: true,
          onCloseComplete: () => window.location.reload(false),
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getDetails = (value) => {
    Axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/orders/getDetails?orders_id=${value}`,
      {
        headers: { Authorization: token },
      }
    )
      .then((response) => {
        setDataDetails(response.data.data);
        setDate(format(new Date(response.data.date), "dd-MMM-yyyy HH:mm"));
        setStatusModal(response.data.status);
        setShipping_method(response.data.shipping_method);
        setWeight(response.data.weight);
        setShipping_cost(response.data.shipping_cost);
        setTotal_price(response.data.total_price);
        setGrand_total(response.data.grand_total);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const showDetails = () => {
    return dataDetails?.map((detail) => {
      return (
        <Box key={detail?.id}>
          <Flex>
            <Image
              src={`${process.env.REACT_APP_API_BASE_URL}/${detail.imageUrl}`}
              boxSize="132px"
            />
            <>
              <Text>{detail?.product_name}</Text>
              <Text>
                {detail?.quantity} x Rp {detail?.product_price}
              </Text>
            </>
          </Flex>
        </Box>
      );
    });
  };

  const showOrderList = () => {
    return list.map((value) => {
      return (
        <Box
          key={value.id}
          // boxSize="lg"
          border="1px"
          borderColor="gray.300"
          mt={4}
          px={8}
          py={6}
          className="rounded-none"
          height="200px"
          minW="35vw"
          maxW="lg"
          p={4}
        >
          <Flex>
            <Image
              src={`${process.env.REACT_APP_API_BASE_URL}/${value.order_details[0].imageUrl}`}
              boxSize="132px"
            />
            <Flex flexDirection="column" alignItems="flex-start">
              <Text fontSize="md" ml={8}>
                Transaction date: {value.when}
              </Text>
              {value.status == "Shipped" ? (
                <Badge variant="subtle" colorScheme="green" ml={8}>
                  {value.status}
                </Badge>
              ) : value.status == "Canceled" ? (
                <Badge variant="subtle" colorScheme="red" ml={8}>
                  {value.status}
                </Badge>
              ) : value.status == "Previous payment proof rejected" ? (
                <Badge variant="subtle" colorScheme="yellow" ml={8}>
                  {value.status}
                </Badge>
              ) : (
                <Badge variant="subtle" colorScheme="blue" ml={8}>
                  {value.status}
                </Badge>
              )}
              {value.order_details.length > 1 &&
              value.order_details.length - 1 != 1 ? (
                <Box ml={8} mt={4}>
                  {value.order_details[0].product_name} and{" "}
                  {value.order_details.length - 1} other
                </Box>
              ) : (
                <Box ml={8} mt={4}>
                  {value.order_details[0].product_name}
                </Box>
              )}
              <Box ml={8} mt={4}>
                Total payment: Rp{value.total_price + value.shipping_cost}
              </Box>
            </Flex>
          </Flex>
          {value.status == "Waiting for payment" ? (
            <>
              <Button
                colorScheme="gray"
                variant="subtle"
                onClick={() => {
                  onCancelOpen();
                  // setIdToCancel(value.id);
                }}
                className="font-[Oswald]"
              >
                Cancel order
              </Button>
              <Modal isOpen={isCancelOpen} onClose={onCancelClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Request order cancellation?</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    This action can't be undone. Please add your reason for
                    cancellation:
                  </ModalBody>
                  <Select placeholder="Select reason">
                    <option>I bought the wrong item</option>
                    <option>I don't need it anymore</option>
                    <option>I want to change my address</option>
                  </Select>
                  <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onCancelClose}>
                      Close
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleCancelButton(value.id)}
                    >
                      Cancel my order
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
              <Button
                variant="buttonBlack"
                type="submit"
                onClick={() =>
                  navigate(`/user/upload-payment-proof?id=${value.id}`)
                }
              >
                Upload payment proof
              </Button>
            </>
          ) : value.status == "Previous payment proof rejected" ? (
            <>
              <Button
                colorScheme="gray"
                variant="subtle"
                onClick={() => {
                  onCancelOpen();
                }}
                className="font-[Oswald]"
              >
                Cancel order
              </Button>
              <Modal isOpen={isCancelOpen} onClose={onCancelClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Request order cancellation?</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    This action can't be undone. Please add your reason for
                    cancellation:
                  </ModalBody>
                  <Select placeholder="Select reason">
                    <option>I bought the wrong item</option>
                    <option>I don't need it anymore</option>
                    <option>I want to change my address</option>
                  </Select>
                  <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onCancelClose}>
                      Close
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleCancelButton(value.id)}
                    >
                      Cancel my order
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
              <Button
                variant="buttonBlack"
                type="submit"
                onClick={() =>
                  navigate(`/user/upload-payment-proof?id=${value.id}`)
                }
              >
                Re-upload payment proof
              </Button>
            </>
          ) : value.status == "Shipped" ? (
            <>
              <Button
                variant="buttonBlack"
                type="submit"
                onClick={onConfirmOpen}
              >
                Confirm delivery order
              </Button>
              <AlertDialog
                isOpen={isConfirmOpen}
                leastDestructiveRef={cancelRef}
                onClose={onConfirmClose}
              >
                <AlertDialogOverlay>
                  <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                      Confirm received?
                    </AlertDialogHeader>

                    <AlertDialogBody>
                      Have your order received? Please confirm your delivered
                      order on the Big4commerce within 7 days. Once confirmed,
                      your payment will be released to us. If there is no
                      confirmation within the specified time, the payment will
                      be transferred automatically.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                      <Button ref={cancelRef} onClick={onConfirmClose}>
                        Cancel
                      </Button>
                      <Button
                        colorScheme="green"
                        onClick={() => {
                          onConfirmClose();
                          handleConfirmButton(value.id);
                        }}
                        ml={3}
                      >
                        Confirm
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialogOverlay>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button
                variant="subtle"
                onClick={() => {
                  getDetails(value.id);
                  onDetailsOpen();
                }}
                className="font-[Oswald]"
              >
                Transaction details
              </Button>
            </>
          )}
        </Box>
      );
    });
  };

  const handlePageClick = (data) => {
    setPage(data.selected);
  };

  return (
    <>
      <div className="mx-auto min-h-[70vh]">
        <Box
          id="sort and filter"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            // boxSize="lg"
            border="1px"
            borderColor="gray.300"
            mt={4}
            px={8}
            pt={6}
            className="rounded-none"
            height="100px"
            minW="35vw"
            maxW="lg"
            p={4}
          >
            <Text>Filter transaction:</Text>
            <Flex>
              <Select
                placeholder="Select status"
                onChange={(element) => setStatus(element.target.value)}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Waiting for payment">Waiting for payment</option>
                <option value="Waiting for confirmation">
                  Waiting for confirmation
                </option>
                <option value="Previous payment proof rejected">
                  Payment proof rejected
                </option>
                <option value="Canceled">Canceled</option>
              </Select>

              <Select
                placeholder="Latest/Oldest"
                onChange={(element) => setOrder(element.target.value)}
              >
                <option value="DESC">Latest</option>
                <option value="ASC">Oldest</option>
              </Select>
            </Flex>
          </Box>
          <Box w="100%" mt={8}>
            <Text fontSize="xl" className="font-[Oswald]">
              My Transaction
            </Text>
            {showOrderList()}
            <Modal isOpen={isDetailsOpen} onClose={onDetailsClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Transaction Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text as="b">Status:</Text>
                  {statusModal == "Confirmed" ? (
                    <Text variant="subtle" colorScheme="green">
                      done
                    </Text>
                  ) : statusModal == "Canceled" ? (
                    <Text variant="subtle" colorScheme="red">
                      {statusModal}
                    </Text>
                  ) : (
                    <Text variant="subtle" colorScheme="blue">
                      {statusModal}
                    </Text>
                  )}
                  <Text as="b">Transaction Date:</Text>
                  <Text>{date}</Text>
                  <Divider my="4" />
                  <Text as="b">Product Details:</Text>
                  {showDetails()}
                  <Text mt="4">Total weight: {weight} gr</Text>
                  <Text>Shipping method: {shipping_method}</Text>
                  <Divider my="4" />
                  <Text as="b">Payment Details</Text>
                  <Text>Payment method: Bank transfer</Text>
                  <Text>Shipping cost: Rp{shipping_cost}</Text>
                  <Text>Total price: Rp{total_price}</Text>
                  <Text as="b">
                    Grand Total: Rp
                    {grand_total}
                  </Text>
                </ModalBody>

                <ModalFooter>
                  <Button colorScheme="blue" mr={3} onClick={onDetailsClose}>
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
          <div className="mt-5 flex items-center justify-center">
            <ReactPaginate
              previousLabel={"< Previous"}
              nextLabel={"Next >"}
              breakLabel={"..."}
              pageCount={totalPage}
              marginPagesDisplayed={2}
              pageRangeDisplayed={2}
              onPageChange={handlePageClick}
              containerClassName={"flex"}
              pageClassName={"page-item"}
              pageLinkClassName={
                "mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              }
              previousLinkClassName={
                "mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              }
              nextLinkClassName={
                "mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              }
            />
          </div>
        </Box>
      </div>
    </>
  );
};

export default OrderList;
