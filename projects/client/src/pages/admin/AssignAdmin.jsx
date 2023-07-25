import { Text, Button, Select, useToast } from "@chakra-ui/react";
import Axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AssignAdmin = () => {
  // nampung hasil get data warehouse
  const [warehouseData, setWarehouseData] = useState([]);
  const [city, setCity] = useState("");

  // nampung pilihan admin
  const [warehouse, setWarehouse] = useState("");

  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const getWarehouseData = () => {
    Axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/availableWarehouse`)
      .then((response) => {
        setWarehouseData(response.data.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getWarehouseData();
  }, []);

  const assignButton = () => {
    Axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/assignNewAdmin`, {
      admins_id: id,
      id: warehouse,
    })
      .then(() => {
        toast({
          title: "Admin assigned!",
          status: "success",
          duration: 9000,
          isClosable: true,
          onCloseComplete: () =>
            navigate("/admin/manageadmin", { replace: true }),
        });
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: `Error`,
          status: "warning",
          duration: 9000,
          isClosable: true,
          onCloseComplete: () =>
            navigate("/admin/manageadmin", { replace: true }),
        });
      });
  };

  return (
    <div className="d-flex flex-col w-full">
      {warehouseData.length == 0 ? (
        <>
          <Text fontSize="lg" mt="24">
            No worries! All warehouse have an admin assigned for them already.
          </Text>
          <Button mt="12" onClick={() => navigate(`/admin/manageadmin`)}>
            Back to admin list
          </Button>
        </>
      ) : (
        <>
          <div className="d-flex flex-row justify-content-center">
            <div className="my-5 mx-5 px-5 text-start">
              <div>
                <Text fontSize="xl" as="b">
                  Assign warehouse admin
                </Text>
              </div>
            </div>
            <div className="my-5 mx-5 px-5">
              <div className="mt-5 pt-5 text-muted fw-bold text-start">
                <Select
                  placeholder="Select warehouse"
                  onChange={(element) => {
                    setWarehouse(element.target.value.split(",")[0]);
                    setCity(element.target.value.split(",")[1]);
                  }}
                >
                  {warehouseData.map((value) => {
                    return (
                      <option
                        value={value.id + "," + value.city}
                        key={value.id}
                      >
                        {value.name}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div>
                <div className="mt-4 text-muted fw-bold text-start">
                  <Text fontSize="md">City</Text>
                  <Text fontSize="md">{city}</Text>
                </div>
              </div>
            </div>
          </div>
          <Button
            colorScheme="facebook"
            style={{ width: "15%", marginInline: "auto", marginBottom: 50 }}
            onClick={assignButton}
          >
            Assign admin
          </Button>
        </>
      )}
    </div>
  );
};

export default AssignAdmin;
