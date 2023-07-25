import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
  useToast,
  FormErrorMessage,
  Skeleton,
} from "@chakra-ui/react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  cartSelector,
  getTotalPriceInCart,
  getTotalProductsInCart,
  getTotalWeightInCart,
} from "../../reducers/cartSlice";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

const Checkout = () => {
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [warehouseAddresses, setWarehouseAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedAddressID, setSelectedAddressId] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [courierSelect, setCourierSelect] = useState(null);
  const [shippingMethod, setShippingMethod] = useState(null);
  const [finalCost, setFinalCost] = useState(null);
  const [shippingCosts, setShippingCosts] = useState([]);
  const [nearestWarehouse, setNearestWarehouse] = useState(null);
  const [shippingCostLoading, setShippingCostLoading] = useState(false);
  const [primaryAddress, setPrimaryAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  const courierRef = useRef(null);
  const costRef = useRef(null);

  const token = localStorage.getItem("user_token");

  const carts = useSelector(cartSelector.selectAll);
  const subtotal = useSelector(getTotalPriceInCart);
  const totalProductsInCart = useSelector(getTotalProductsInCart);
  const totalWeightInCart = useSelector(getTotalWeightInCart);

  const toast = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    fetchWarehouseData();
    const fetchAddressesData = async () => {
      setLoading(true);
      try {
        const warehouseResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/warehouses/getAllWarehouse`
        );
        setWarehouseAddresses(warehouseResponse.data);

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/address/get-address?`,
          {
            headers: { Authorization: token },
          }
        );
        const fetchedAddresses = response.data.result;
        setAddresses(fetchedAddresses);
        const primary = fetchedAddresses.find(
          (address) => address.is_primary === true
        );
        setPrimaryAddress(primary);
        setSelectedAddress(primary);

        if (primary) {
          const nearest = findShortestDistance(
            primary.latitude,
            primary.longitude,
            warehouseResponse.data
          );
          setNearestWarehouse(nearest);
          formik.setFieldValue("user_addresses_id", primary.id);
          formik.setFieldValue("warehouses_id", nearest.id);
        }
      } catch (error) {
        toast({
          title: "Error fetching addresses.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      setLoading(false);
    };
    fetchAddressesData();
  }, []);

  function haversineDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) {
      return (x * Math.PI) / 180;
    }

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  function findShortestDistance(baseLat, baseLon, locations) {
    let shortestDistance = Infinity;
    let nearestLocation;

    for (const location of locations) {
      const distance = haversineDistance(
        baseLat,
        baseLon,
        location.latitude,
        location.longitude
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestLocation = location;
      }
    }

    return nearestLocation;
  }

  function extractCityTypeAndName(fullName) {
    const match = fullName.match(/(Kabupaten|Kota) (.+)/i);
    if (match) {
      return [match[1], match[2]];
    }
    return [null, null];
  }

  const fetchShippingCost = async (
    originName,
    destinationName,
    totalWeight,
    courier
  ) => {
    try {
      const citiesResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/warehouses/getCityData?province_id=`
      );
      const cities = citiesResponse.data;

      const [originType, originCityName] = extractCityTypeAndName(originName);
      const [destinationType, destinationCityName] =
        extractCityTypeAndName(destinationName);

      const originId = cities.find(
        (city) =>
          city.type.toLowerCase() === originType.toLowerCase() &&
          city.city_name.toLowerCase() === originCityName.toLowerCase()
      ).city_id;
      const destinationId = cities.find(
        (city) =>
          city.type.toLowerCase() === destinationType.toLowerCase() &&
          city.city_name.toLowerCase() === destinationCityName.toLowerCase()
      ).city_id;

      // Calculate shipping cost
      const costUrl = `${process.env.REACT_APP_API_BASE_URL}/warehouses/getCostData?originName=${originId}&destinationName=${destinationId}&totalWeight=${totalWeight}&courier=${courier}`;
      const costResponse = await axios.get(costUrl);

      const shippingInfoResponse = costResponse.data[0]?.costs;

      setShippingCosts(shippingInfoResponse);
    } catch (error) {
      console.error("Error fetching shipping cost:", error);
    }
  };

  const fetchWarehouseData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/warehouses/getAllWarehouse`
      );

      setWarehouseAddresses(response.data);
    } catch (error) {
      toast({
        title: "Error fetching addresses.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      // Replace with your API endpoint to get all addresses
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/address/get-address?`,
        {
          headers: { Authorization: token },
        }
      );
      const fetchedAddresses = response.data.result;
      setAddresses(fetchedAddresses);
      const primary = fetchedAddresses.find(
        (address) => address.is_primary === true
      );
      setPrimaryAddress(primary);
    } catch (error) {
      toast({
        title: "Error fetching addresses.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const handleAddressChange = (e) => {
    setSelectedAddress(e.target.value);
  };

  const handleNewAddressChange = (e) => {
    setNewAddress(e.target.value);
  };

  const addNewAddress = async () => {
    try {
      // const response = await axios.post('/api/addresses', { address: newAddress });
      // setAddresses([...addresses, response.data]);
      // setSelectedAddress(response.data.id);
      // setNewAddress('');
    } catch (error) {
      console.error("Error adding new address:", error);
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleAddressSelect = (e) => {
    const selected = JSON.parse(e.target.value);
    const selectedAddressID = JSON.parse(e.target.value).id;

    setSelectedAddress(selected);
    setSelectedAddressId(selectedAddressID);
    setShippingCosts([]);
    setCourierSelect(null);
    const nearest = findShortestDistance(
      selected.latitude,
      selected.longitude,
      warehouseAddresses
    );
    setNearestWarehouse(nearest);

    formik.values.user_addresses_id = selectedAddressID;
    formik.values.warehouses_id = nearest.id;

    if (courierRef.current) {
      courierRef.current.value = "";
    }
    if (costRef.current) {
      costRef.current.value = "";
    }

    // const shippingCost = fetchShippingCost(selected.city, nearest.city)
    // fetchShippingCost(selected.city, nearest.city, totalWeightInCart)
    setFinalCost(null);
    onClose();
  };

  const handleCostSelect = (e) => {
    const selectedCost = JSON.parse(e.target.value).cost[0].value;
    const selectedService = JSON.parse(e.target.value).service;

    setShippingMethod(`${courierSelect} - ${selectedService}`);
    setFinalCost(selectedCost);

    formik.values.total_price = subtotal;
    formik.values.shipping_method = `${courierSelect} - ${selectedService}`;
    formik.values.shipping_cost = selectedCost;
  };

  const handleCourierSelect = (e) => {
    const selectedCourier = e.target.value;

    setShippingCosts([]);
    setCourierSelect(null);
    setCourierSelect(selectedCourier);

    fetchShippingCost(
      selectedAddress?.city,
      nearestWarehouse?.city,
      totalWeightInCart,
      selectedCourier
    );
    setFinalCost(null);

    if (costRef.current) {
      costRef.current.value = "";
    }

    onClose();
  };

  const handleNewAddressSubmit = async (newAddress) => {
    try {
      const response = await axios.post("/api/addresses", {
        address: newAddress,
      });
      setAddresses([...addresses, response.data]);
    } catch (error) {
      console.error("Error adding new address:", error);
    }
  };

  const handleAddOrder = async (values, { setSubmitting, resetForm }) => {
    try {
      // Replace with your API endpoint to add an address
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/orders/add-order`,
        values,
        {
          headers: { Authorization: token },
        }
      );
      setOrders([...orders, response.data]);

      toast({
        title: "Orders added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetForm();

      navigate("/user/order-list");
    } catch (error) {
      toast({
        title: "Product in your cart exceeds available stocks.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      total_price: "",
      status: "Waiting for payment",
      shipping_method: "",
      shipping_cost: "",
      user_addresses_id: "",
      warehouses_id: "",
    },
    validationSchema: Yup.object({
      shipping_method: Yup.string().required(
        "Courier or/and shipping method required"
      ),
      user_addresses_id: Yup.number().required("Shipping Address required"),
    }),
    onSubmit: handleAddOrder,
  });

  const ModalAddress = ({
    isOpen,
    onClose,
    addresses,
    handleAddressSelect,
    handleNewAddressSubmit,
  }) => {
    const {
      isOpen: isNewAddressOpen,
      onOpen: onNewAddressOpen,
      onClose: onNewAddressClose,
    } = useDisclosure();

    return (
      <>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontFamily="Oswald">Select an Address</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Select
                fontFamily="Roboto"
                placeholder="Select address"
                onChange={handleAddressSelect}>
                {addresses.map((address) => (
                  <option
                    key={address.id}
                    value={JSON.stringify(
                      // {[address.address, address.recipient, address.phone_number]}>
                      address
                    )}>
                    {address.recipient}
                  </option>
                ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Link to="/user/add-address/checkout">
                <Button
                  variant="buttonBlack"
                  colorScheme="blue"
                  mr={3}
                  onClick={onNewAddressOpen}>
                  Add New Address
                </Button>
              </Link>
              <Button variant="buttonWhite" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <NewAddressModal
          isOpen={isNewAddressOpen}
          onClose={onNewAddressClose}
          handleNewAddressSubmit={handleNewAddressSubmit}
        />
      </>
    );
  };

  const NewAddressModal = ({ isOpen, onClose, handleNewAddressSubmit }) => {
    const [newAddress, setNewAddress] = useState("");

    const handleNewAddressChange = (e) => {
      setNewAddress(e.target.value);
    };

    const handleSubmit = () => {
      handleNewAddressSubmit(newAddress);
      onClose();
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="Oswald">Add New Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel fontFamily="Oswald">New Address</FormLabel>
              <Input
                fontFamily="Roboto"
                type="text"
                value={newAddress}
                onChange={handleNewAddressChange}
                placeholder="Enter your address"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="buttonBlack" mr={3} onClick={handleSubmit}>
              Save
            </Button>
            <Button variant="buttonWhite" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <Box minH={"70vh"} width="100%" maxWidth="1000px" mx="auto" py={5}>
      <form onSubmit={formik.handleSubmit}>
        <h1 className="mb-10 text-center text-2xl font-bold font-[Oswald]">
          Checkout
        </h1>
        <div className="flex flex-col justify-between w-full">
          <div className="bg-white py-5">
            <div className="mx-auto max-w-5xl justify-center px-6 md:flex md:space-x-6 xl:px-0">
              <div className="rounded-sm md:w-2/3">
                {carts.length !== 0 ? (
                  carts.map((cart, index) => {
                    return (
                      <div
                        key={index}
                        className="justify-between border border-gray-200 mb-6 rounded-none bg-white p-6 shadow-md sm:flex sm:justify-start">
                        <img
                          onClick={() =>
                            navigate(`/product-details/${cart.product.id}`)
                          }
                          src={`${process.env.REACT_APP_API_BASE_URL}/${cart.product.imageUrl}`}
                          alt={cart.product.name}
                          className="w-full rounded-sm sm:w-40"
                        />
                        <div className="sm:ml-4 sm:flex sm:w-full sm:justify-between">
                          <div className="mt-5 sm:mt-0">
                            <h2
                              onClick={() =>
                                navigate(`/product-details/${cart.product.id}`)
                              }
                              className="text-lg font-[Oswald] text-gray-900">
                              {cart.product?.name}
                            </h2>
                            <p className="mt-1 text-xs text-gray-700 text-left font-[Roboto]">
                              Weight:{" "}
                              {(
                                cart.quantity * cart.product.weight
                              ).toLocaleString("ID")}{" "}
                              grams
                            </p>
                            <p className="mt-1 text-xs text-gray-700 text-left font-[Roboto]">
                              Qty: {cart.quantity} Pcs
                            </p>
                          </div>
                          <div className="mt-4 flex justify-end sm:space-y-6 sm:mt-0 sm:block sm:space-x-6">
                            <div className="mt-4 flex justify-between sm:space-y-6 sm:mt-0 sm:block sm:space-x-6">
                              <div className="flex md:flex-col items-center space-x-4 mt-2">
                                <p className="text-sm font-bold font-[Roboto]">
                                  {(
                                    cart.product.price * cart.quantity
                                  ).toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col col-span-4 justify-center items-center my-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 font-[Oswald]">
                      No product in your checkout list
                    </h1>
                    <p className="text-gray-700 text-lg mb-8 font-[Roboto]">
                      Continue shopping and add some product to cart and do
                      checkout
                    </p>
                    <Button
                      variant="buttonBlack"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={() => navigate("/")}>
                      Go Shopping
                    </Button>
                  </div>
                )}
              </div>
              <div
                className={`sticky top-[5.7rem] mt-6 h-full rounded-none border bg-white p-6 shadow-md md:mt-0 md:w-1/3 ${
                  carts.length === 0 ? "hidden" : null
                }`}>
                <Flex justifyContent="center" alignItems="center">
                  <Heading
                    size="md"
                    className="text-center"
                    fontFamily="Oswald">
                    Shipping Address
                  </Heading>
                </Flex>
                <hr className="my-4" />
                {!loading && addresses.length !== 0 ? (
                  <Flex>
                    <Box textAlign={"left"}>
                      <Text
                        justifyContent="space-between"
                        fontFamily="Oswald"
                        fontSize="lg">
                        {(selectedAddress || primaryAddress)?.recipient}
                      </Text>
                      <Text fontFamily="Roboto">
                        {(selectedAddress || primaryAddress)?.phone_number}
                      </Text>
                      <Text mb={4} fontFamily="Roboto">
                        {(selectedAddress || primaryAddress)?.address}
                        {", "}
                        {(selectedAddress || primaryAddress)?.district}
                        {", "}
                        {(selectedAddress || primaryAddress)?.city}
                        {", "}
                        {(selectedAddress || primaryAddress)?.province}
                      </Text>
                      <div className=" items-center">
                        <Link>
                          <FormControl
                            isInvalid={
                              formik.errors.user_addresses_id &&
                              formik.touched.user_addresses_id
                            }>
                            <Button
                              variant="buttonBlack"
                              onClick={onOpen}
                              colorScheme="blue"
                              mr={4}>
                              Change Address
                            </Button>
                            <FormErrorMessage>
                              {formik.errors.user_addresses_id}
                            </FormErrorMessage>
                          </FormControl>
                        </Link>

                        {(selectedAddress || primaryAddress) && (
                          <FormControl
                            isInvalid={
                              formik.errors.shipping_method &&
                              formik.touched.shipping_method
                            }>
                            <Select
                              mt={2}
                              fontFamily="Roboto"
                              id="courier"
                              name="courier"
                              type="text"
                              placeholder="Select Courier"
                              ref={courierRef}
                              onChange={handleCourierSelect}>
                              {[
                                { value: "jne", label: "JNE" },
                                { value: "tiki", label: "Tiki" },
                                { value: "pos", label: "POS Indonesia" },
                              ].map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                            <FormErrorMessage>
                              {formik.errors.shipping_method}
                            </FormErrorMessage>
                          </FormControl>
                        )}

                        <div className="w-auto">
                          {courierSelect && (
                            <Skeleton isLoaded={!shippingCostLoading}>
                              {shippingCosts.length === 0 ? (
                                <Stack>
                                  <Skeleton mt={2} height="40px" />{" "}
                                </Stack>
                              ) : (
                                <FormControl
                                  isInvalid={
                                    formik.errors.shipping_method &&
                                    formik.touched.shipping_method
                                  }>
                                  <Select
                                    mt={2}
                                    fontFamily="Roboto"
                                    id="cost"
                                    name="cost"
                                    type="text"
                                    placeholder="Select Cost"
                                    onChange={handleCostSelect}
                                    ref={costRef}>
                                    {shippingCosts.map(
                                      (shippingCost, index) => (
                                        <option
                                          key={index}
                                          value={JSON.stringify(shippingCost)}>
                                          {shippingCost.description} -{" "}
                                          {shippingCost.cost[0].value.toLocaleString(
                                            "id-ID",
                                            {
                                              style: "currency",
                                              currency: "IDR",
                                            }
                                          )}
                                        </option>
                                      )
                                    )}
                                  </Select>
                                  <FormErrorMessage>
                                    {formik.errors.shipping_method}
                                  </FormErrorMessage>
                                </FormControl>
                              )}
                            </Skeleton>
                          )}
                        </div>
                      </div>
                    </Box>
                  </Flex>
                ) : (
                  <Stack spacing={4} mb={4}>
                    <h1 className="text-lg font-bold font-[Oswald] text-gray-900 mb-2">
                      No address founded.
                    </h1>
                    <p className="text-gray-700 text-md mb-8 font-[Roboto]">
                      Please add new address for process your order.
                    </p>
                    {addresses.length === 0 && (
                      <Link to="/user/add-address/checkout">
                        <Button
                          variant="buttonBlack"
                          onClick={addNewAddress}
                          colorScheme="teal"
                          mb={4}
                          mt={8}>
                          Add New Address
                        </Button>
                      </Link>
                    )}
                  </Stack>
                )}

                <hr className="my-4" />

                <div className="mb-2 mt-6 flex justify-between">
                  <p className="text-gray-700 font-[Roboto]">
                    Subtotal ({totalProductsInCart} items)
                  </p>
                  <p className="text-gray-700 font-[Oswald] ">
                    {subtotal.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </p>
                </div>

                {finalCost && (
                  <div className="mb-2 flex justify-between">
                    <p className="text-gray-700 font-[Roboto]">Shipping Fee</p>
                    <div className="">
                      <p className="text-gray-700 font-[Oswald]">
                        {finalCost.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* {nearestWarehouse && (
                <div className="mb-2 flex justify-between">
                  <p className="text-gray-700">Nearest Warehouse</p>
                  <div className="">
                    <p className="text-gray-700">{nearestWarehouse.id}</p>
                  </div>
                </div>
              )} */}

                <hr className="my-4 " />
                <div className="flex justify-between">
                  <p className="text-lg font-bold font-[Roboto]">Grand Total</p>
                  <div className="">
                    <p className="mb-1 text-lg font-bold font-[Oswald]">
                      {(subtotal + finalCost).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                  </div>
                </div>
                <Box mt={6}>
                  <Button
                    type="submit"
                    variant="buttonBlack"
                    width="100%"
                    isLoading={formik.isSubmitting}>
                    Proceed to Payment
                  </Button>
                </Box>
              </div>
            </div>
          </div>
          <ScrollToTopButton />
        </div>

        <ModalAddress
          isOpen={isOpen}
          onClose={onClose}
          addresses={addresses}
          handleAddressSelect={handleAddressSelect}
          handleNewAddressSubmit={handleNewAddressSubmit}
        />
      </form>
    </Box>
  );
};

export default Checkout;
