"use client";
// import { useState } from 'react'
import { useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import taskContractABI from "@/utils/abi/taskContractABI.json";
import {
  readContract,
  readContracts,
  writeContract,
  prepareWriteContract,
  waitForTransaction,
} from "@wagmi/core";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Checkbox from "@material-ui/core/Checkbox";
import {
  IPFSSubmition,
  TasksOverview,
  TasksPagination,
  TasksCounting,
} from "@/types/task";
import erc20ContractABI from "@/utils/abi/erc20ContractABI.json";
import { File, SmileySad, Info } from "phosphor-react";

const Registration = () => {
  const [stateOpen, setStateOpen] = useState<String>("");
  const [selectedOptions, setSelectedOptions] = useState({
    subTopics: {},
    deliveryMethod: {},
  });

  function handleCheckboxChange(category, index, subIndex, checked) {
    const newSelectedOptions = { ...selectedOptions };
    newSelectedOptions[category][`${index}-${subIndex}`] = checked;
    setSelectedOptions(newSelectedOptions);
  }

  function handleBookTimeSlot(href, index) {
    const params = {
      a2: Object.keys(selectedOptions.subTopics)
        .filter(
          (key) => key.startsWith(index) && selectedOptions.subTopics[key]
        )
        .map((key) => parseInt(key.split("-")[1]) + 1)
        .join(","),
      a3: Object.keys(selectedOptions.deliveryMethod)
        .filter(
          (key) => key.startsWith(index) && selectedOptions.deliveryMethod[key]
        )
        .map((key) => parseInt(key.split("-")[1]) + 1)
        .join(","),
    };

    const url = `${href}?a2=${params.a2}&a3=${params.a3}`;
    window.location.href = url; // Redireciona para a URL construída
  }

  function handleChange(index: string) {
    setStateOpen(index);
  }

  const datas = [
    {
      name: "Securitization of real estate, private equity, tokenization",
      subTopicsOptions: [
        "Crypto-Based Universal Basic Income",
        "On-Chain Diplomacy",
        "Decentralized Intellectual Property Rights Management",
        "Personalized Education Records and Credentials",
      ],
      deliveryMethodOptions: [
        "Virtual keynote speech + pitch deck ? sharing (20min + 5min Q&A)",
        "Virtual Panel talk (20min)",
        "Panel talks (between 2-5 people)",
        "Product demo screen share (40min)",
      ],
      href: "https://calendly.com/bruno-santos-laureano/securitization",
    },
    {
      name: "Exchange-Traded Funds (ETFs), Bonds, Private Equities",
      subTopicsOptions: [
        "CBDC Infrastructure and Services",
        "Supply Chain Financing: Real-time tracking",
        "Tokenized Commodities",
        "Personalized Education Records and Credentials",
      ],
      deliveryMethodOptions: [
        "Product demo screen share (40min)",
        "Product demo screen share (30min)",
        "Panel talks (between 2-5 people)",
        "Product demo screen share (40min)",
      ],
      href: "https://calendly.com/bruno-santos-laureano/securitization",
    },
  ];

  return (
    <>
      <section className="px-[100px] pb-[400px] pt-[80px]" id={"taskStart"}>
        <div className="container px-0">
          <div className=" text-[16px] font-normal !leading-[19px] text-[#000000]">
            <div className="text-[30px] font-bold !leading-[36px]">
              Speaker registration
            </div>
            <div className="mt-[38px] flex justify-between">
              <div className="flex w-[345px]">
                <p className="mr-[19px] flex text-[18px] font-bold">Step 01</p>
                <p className="w-[251px]">
                  Pick the industries/areas in which you would share your
                  expertise.
                </p>
              </div>
              <div className="flex w-[345px]">
                <p className="mr-[19px] text-[18px] font-bold">Step 02</p>
                <p className="w-[251px]">
                  Pick the industries/areas in which you would share your
                  expertise.
                </p>
              </div>
              <div className="flex w-[345px]">
                <p className="mr-[19px] flex items-start text-[18px] font-bold">
                  Step 03
                </p>
                <p className="w-[251px]">
                  Pick the industries/areas in which you would share your
                  expertise.
                </p>
              </div>
            </div>
            <div className="mt-[79px] grid grid-cols-2 gap-x-[10px] gap-y-[9px]">
              {datas.map((data, index) =>
                stateOpen !== String(index) ? (
                  <div
                    key={index}
                    onClick={() => {
                      handleChange(String(index));
                    }}
                    className="flex h-[56px] cursor-pointer justify-between rounded-[5px] bg-[#0354EC] pl-[28px] pr-[13px] font-medium text-white  hover:bg-[#173979]"
                  >
                    <div className="flex items-center text-[18px] !leading-[22px]">
                      {data.name}
                    </div>
                    <div className="flex items-center text-[30px] !leading-[36px]">
                      +
                    </div>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="rounded-[5px] bg-[#F3F3F3] pb-[55px] pl-[28px] pr-[13px] pt-[17px] font-medium  text-[#000000]"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center text-[18px] !leading-[22px]">
                        {data.name}
                      </div>
                      <div
                        onClick={() => {
                          handleChange("-1");
                        }}
                        className="flex cursor-pointer items-center text-[30px] !leading-[36px] text-[#646464]"
                      >
                        -
                      </div>
                    </div>
                    <div className="mt-[41px] pl-[10px]">
                      <div>
                        <div className="flex">
                          <div className="mr-[12px] border-b border-[#000000] text-[16px] font-bold">
                            Sub topics
                          </div>
                          <div className="-mb-[3px] flex items-end text-[10px] font-normal text-[#646464]">
                            You can choose multiple
                          </div>
                        </div>
                        <div className="mt-[24px]">
                          <div className="grid grid-cols-2 gap-x-[41px] gap-y-[13px]">
                            {data.subTopicsOptions.map((topic, subIndex) => (
                              <div className="flex">
                                <Checkbox
                                  checked={
                                    selectedOptions.subTopics[
                                      `${index}-${subIndex}`
                                    ] || false
                                  }
                                  onChange={(e) =>
                                    handleCheckboxChange(
                                      "subTopics",
                                      index,
                                      subIndex,
                                      e.target.checked
                                    )
                                  }
                                  color="default"
                                  inputProps={{ "aria-label": "" }}
                                  className=""
                                />
                                <p className="flex items-center text-[14px] font-normal text-[#646464]">
                                  {topic}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-[44px]">
                        <div className="flex">
                          <div className="mr-[12px] border-b border-[#000000] text-[16px] font-bold">
                            Delivery method
                          </div>
                          <div className="-mb-[3px] flex items-end text-[10px] font-normal text-[#646464]">
                            You can choose multiple
                          </div>
                        </div>
                        <div className="mt-[24px]">
                          <div className="grid grid-cols-2 gap-x-[41px] gap-y-[13px]">
                            {data.deliveryMethodOptions.map(
                              (method, subIndex) => (
                                <div className="flex">
                                  <Checkbox
                                    checked={
                                      selectedOptions.deliveryMethod[
                                        `${index}-${subIndex}`
                                      ] || false
                                    }
                                    onChange={(e) =>
                                      handleCheckboxChange(
                                        "deliveryMethod",
                                        index,
                                        subIndex,
                                        e.target.checked
                                      )
                                    }
                                    color="default"
                                    inputProps={{ "aria-label": "" }}
                                    className=""
                                  />
                                  <p className="flex items-center text-[14px] font-normal text-[#646464]">
                                    {method}
                                  </p>
                                </div>
                              )
                            )}
                            <a
                              onClick={() =>
                                handleBookTimeSlot(data.href, index)
                              }
                              className=" mt-[45px] flex h-[51px] w-[180px] items-center justify-center rounded-[8px] bg-[#0354EC] px-[32px] text-[16px] font-bold text-white hover:bg-[#173979]"
                            >
                              Book time slot
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Registration;
