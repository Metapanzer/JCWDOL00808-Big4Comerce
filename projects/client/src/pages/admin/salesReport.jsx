import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
  Flex,
} from "@chakra-ui/react";
import jwtDecode from "jwt-decode";
import { Chart } from "react-google-charts";

const SalesReport = () => {
  const [report, setReport] = useState({ monthly: [], weekly: [] });
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [warehouse, setWarehouse] = useState("");
  const [category, setCategory] = useState("");
  const [product, setProduct] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategoriesProducts] = useState([]);
  const [role, setRole] = useState(0);

  useEffect(() => {
    fetchReport();
    fetchData();
  }, []);

  const fetchReport = async () => {
    try {
      // Get the token from localStorage
      const token = window.localStorage.getItem("token");

      // Decode the token and extract the email
      const decodedToken = jwtDecode(token);
      const email = decodedToken.email;
      const decodedRole = decodedToken.role;

      setRole(decodedRole);

      // Replace the URL below with the correct endpoint for your API.
      let url = `${process.env.REACT_APP_API_BASE_URL}/admin/sales-report?email=${email}&start_date=${startDate}&end_date=${endDate}`;
      if (warehouse) url += `&warehouse_filter=${warehouse}`;
      if (category) url += `&category_filter=${category}`;
      if (product) url += `&product_filter=${product}`;

      const response = await axios.get(url);
      setReport(response.data.report);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = async () => {
    const responseWarehouse = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/warehouses/getAllWarehouse`
    );
    setWarehouses(responseWarehouse.data);

    const responseProduct = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/product/listAllproduct`
    );
    setProducts(responseProduct.data.result);

    const responseCategory = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/productcategory/listproductcategory`
    );
    setCategoriesProducts(responseCategory.data.allResult);
  };

  const createChartData = (data) => {
    // Check if there is any data
    if (!data || data.length === 0) {
      // If there is no data, create a dummy entry with zero values
      return [
        ["Time Period", "Total", "Total Quantity"],
        ["No data", 0, 0],
      ];
    }

    const chartData = [
      ["Time Period", "Total", "Total Quantity"],
      ...data.map((item) => [
        item.timePeriod,
        Number(item.total),
        Number(item.totalQuantity),
      ]),
    ];
    return chartData;
  };

  const createCategoryPieChartData = (data) => {
    const categoryTotals = {};

    if (!data) {
      return [
        ["Category", "Total"],
        ["No data", 0],
      ];
    }

    data.forEach((item) => {
      item.categories.forEach((category) => {
        if (categoryTotals[category.id]) {
          categoryTotals[category.id].total += Number(category.total);
        } else {
          categoryTotals[category.id] = {
            name: category.name,
            total: Number(category.total),
          };
        }
      });
    });

    const chartData = [
      ["Category", "Total"],
      ...Object.values(categoryTotals).map((category) => [
        category.name,
        category.total,
      ]),
    ];

    return chartData;
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchReport();
  };

  function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  }

  const renderTable = (data) => (
    <Flex overflowX="auto">
      <Table variant="simple" fontSize="14px">
        <TableCaption mb="2">
          {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Sales
          Report
        </TableCaption>
        <Thead>
          <Tr>
            <Th maxW="100px">Time Period</Th>
            <Th maxW="100px">Total</Th>
            <Th maxW="110px">Total Quantity</Th>
            <Th maxW="120px">Category</Th>
            <Th maxW="100px">Product</Th>
          </Tr>
        </Thead>
        <Tbody>
          {!data || data.length == 0 ? (
            <Tr>
              <Td colSpan={5}>No Data</Td>
            </Tr>
          ) : (
            data.map((item, index) => (
              <Tr key={index}>
                <Td>{item.timePeriod}</Td>
                <Td>{formatRupiah(item.total)}</Td>
                <Td>{item.totalQuantity}</Td>
                <Td>
                  {item.categories.map((category, index) => (
                    <div key={index}>
                      {category.name}: {category.quantity} Pcs
                    </div>
                  ))}
                </Td>
                <Td>
                  {item.products.map((product, index) => (
                    <div key={index}>
                      {product.name} : {formatRupiah(product.total)} (
                      {product.quantity} Pcs)
                    </div>
                  ))}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Flex>
  );

  return (
    <div className="container mx-auto px-4 mb-3">
      <VStack spacing={8} align="stretch">
        <Heading>Sales Report</Heading>
        <form onSubmit={handleFilterSubmit}>
          <Flex
            direction="row"
            wrap="wrap"
            justifyContent="space-between"
            alignItems="center"
          >
            <FormControl minWidth="100px" maxWidth="150px">
              <FormLabel>Warehouse</FormLabel>
              <Select
                placeholder="Select Warehouse"
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                disabled={role === 2}
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl minWidth="100px" maxWidth="150px">
              <FormLabel>Category</FormLabel>
              <Select
                placeholder="Select Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl minWidth="100px" maxWidth="150px">
              <FormLabel>Product</FormLabel>
              <Select
                placeholder="Select Product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl minWidth="100px" maxWidth="150px">
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormControl>
            <FormControl minWidth="100px" maxWidth="150px">
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormControl>
            <Button mt={"8"} colorScheme="blue" type="submit">
              Apply Filters
            </Button>
          </Flex>
        </form>
        <HStack spacing={8} align="stretch">
          <VStack>
            <Chart
              width={"100%"}
              height={"400px"}
              chartType="ColumnChart"
              loader={<div>Loading Chart...</div>}
              data={createChartData(report[timePeriod])}
              options={{
                title: `${
                  timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)
                } Sales Report`,
                hAxis: { title: "Time Period" },
                vAxis: { title: "Total" },
                series: {
                  0: { targetAxisIndex: 0 }, // Total
                  1: { targetAxisIndex: 1 }, // Total Quantity
                },
                vAxes: {
                  0: { title: "Total" },
                  1: { title: "Total Quantity" },
                },
                legend: { position: "top" },
              }}
            />
          </VStack>
          <VStack>
            <Chart
              width={"100%"}
              height={"400px"}
              chartType="PieChart"
              loader={<div>Loading Chart...</div>}
              data={createCategoryPieChartData(report[timePeriod])}
              options={{
                title: "Sales by Category",
                legend: { position: "right" },
              }}
            />
          </VStack>
        </HStack>

        {/* Show the table */}

        <>
          <FormControl>
            <FormLabel>Time Period</FormLabel>
            <Select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </FormControl>
          {renderTable(report[timePeriod])}
        </>
      </VStack>
    </div>
  );
};

export default SalesReport;
