import { fireEvent, render, cleanup, waitFor } from "@testing-library/react";
import { configure, shallow, mount } from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
import App from "../App";
import React = require("react");
import Header from "../components/Header";
import Main from "../components/Main";
import Dropzone from "../components/Dropzone";
configure({ adapter: new ReactSixteenAdapter() });
import axios from "axios";
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("dropzoneComponent", () => {
  afterEach(cleanup);
  it("renders correctly", () => {
    const component = mount(<App />);
    expect(component).toMatchSnapshot();
  });
  it("renders Header", () => {
    const wrapper = shallow(<Header />);
    const text = "Главная";
    expect(wrapper.contains(text)).toEqual(true);
  });
  it("renders Main", () => {
    const wrapper = shallow(<Main />);
    const isP = !!wrapper.find("p");
    expect(isP).toEqual(true);
  });
  it("renders Dropzone", () => {
    const { getByText } = render(<Dropzone />);
    const firstText = getByText(
      "Кликните сюда или переместите XML файлы на это поле"
    );
    expect(firstText).toBeInTheDocument();
  });
  it("click on Dropzone", async () => {
    const { container } = render(<Dropzone />);
    fireEvent.click(container.querySelector("div .dropzone__container"));
  });

  it("css class changes with drag on Dropzone", async () => {
    const { container } = render(<Dropzone />);
    const element = container.querySelector("div.dropzone__container");
    fireEvent.dragEnter(element);
    expect(
      container.querySelector("div.dropzone__hightlight")
    ).not.toBeInTheDocument();
    fireEvent.dragOver(element);
    expect(
      container.querySelector("div.dropzone__hightlight")
    ).toBeInTheDocument();
    fireEvent.dragLeave(element);
    expect(
      container.querySelector("div.dropzone__hightlight")
    ).not.toBeInTheDocument();
  });
  it("add, delete file on Dropzone by click", async () => {
    const { getByText, queryByText, container } = render(<Dropzone />);
    fireEvent.change(container.querySelector("input.dropzone__fileinput"), {
      target: {
        files: {
          0: { name: "test.xml", type: "text/xml", size: 1024 },
          length: 1,
        },
      },
    });
    expect(
      getByText("test.xml", { selector: "span.file__name" })
    ).toBeInTheDocument();
    expect(
      getByText("1 КБ", { selector: "span.file__size" })
    ).toBeInTheDocument();
    fireEvent.click(container.querySelector("div.file__remove"));
    expect(
      queryByText("test.xml", { selector: "span.file__name" })
    ).not.toBeInTheDocument();
  });
  it("add files with zero size on Dropzone", async () => {
    const { getByText, container } = render(<Dropzone />);
    fireEvent.change(container.querySelector("input.dropzone__fileinput"), {
      target: {
        files: {
          0: { name: "test.xml", type: "text/xml", size: 0 },
          length: 1
        },
      },
    });
    expect(getByText("test.xml")).toBeDefined();
  });
  it("add files with different type on Dropzone", async () => {
    const { queryByText, container } = render(<Dropzone />);
    fireEvent.change(container.querySelector("input.dropzone__fileinput"), {
      target: {
        files: {
          0: { name: "test.xml", type: "text/xml", size: 1024 },
          1: { name: "test.json", type: "application/json", size: 56 },
          length: 2
        },
      },
    });
    expect(queryByText("test.xml")).toBeDefined();
    expect(queryByText("test.json")).toBeNull();
  });
  it("add duplicate files on Dropzone", async () => {
    const { getAllByText, container } = render(<Dropzone />);
    fireEvent.change(container.querySelector("input.dropzone__fileinput"), {
      target: {
        files: {
          0: { name: "test.xml", type: "text/xml", size: 1024 },
          1: { name: "test.xml", type: "text/xml", size: 1024 },
          length: 2,
        },
      },
    });
    expect(getAllByText("test.xml").length).toEqual(1);
  });
  it("add, delete file on Dropzone by drop", async () => {
    const { getByText, queryByText, container } = render(<Dropzone />);
    fireEvent.drop(container.querySelector("div.dropzone__container"), {
      dataTransfer: {
        files: {
          0: { name: "test.xml", type: "text/xml", size: 1024 },
          length: 1,
        },
      },
    });
    expect(
      getByText("test.xml", { selector: "span.file__name" })
    ).toBeInTheDocument();
    expect(
      getByText("1 КБ", { selector: "span.file__size" })
    ).toBeInTheDocument();
    fireEvent.click(container.querySelector("div.file__remove"));
    expect(
      queryByText("test.xml", { selector: "span.file__name" })
    ).not.toBeInTheDocument();
  });
  it("upload", async () => {
    const { container, getByText } = render(<Dropzone />);
    expect(container.querySelector("#submit")).not.toBeInTheDocument();
    fireEvent.change(container.querySelector("input.dropzone__fileinput"), {
      target: {
        files: {
          0: { name: "test.xml", type: "text/xml", size: 1024 },
          length: 1,
        },
      },
    });
    expect(container.querySelector("#submit")).toBeInTheDocument();
    global.URL.createObjectURL = jest.fn();
    mockedAxios.post
      .mockResolvedValueOnce({ data: { error: false, message: "test" } })
      .mockResolvedValueOnce(new File(["test"], "test.pdf"));
    fireEvent.click(container.querySelector("#submit"));
    await waitFor(() =>
      getByText(/Кликните сюда или переместите XML файлы на это поле/)
    );
  });
  it("handle XsdValidationError", async () => {
    const { container, getByText } = render(<Dropzone />);
    expect(container.querySelector("#submit")).not.toBeInTheDocument();
    fireEvent.change(container.querySelector("input.dropzone__fileinput"), {
      target: {
        files: {
          0: { name: "test.xml", type: "text/xml", size: 1024 },
          length: 1,
        },
      },
    });
    expect(container.querySelector("#submit")).toBeInTheDocument();
    mockedAxios.post.mockResolvedValueOnce({
      data: { error: true, message: "XsdValidationError" },
    });
    fireEvent.click(container.querySelector("#submit"));
    await waitFor(() => getByText(/Это не акт сдачи-приемки/));
  });
  it("handle any error", async () => {
    const { container, getByText } = render(<Dropzone />);
    expect(container.querySelector("#submit")).not.toBeInTheDocument();
    fireEvent.change(container.querySelector("input.dropzone__fileinput"), {
      target: {
        files: {
          0: { name: "test.xml", type: "text/xml", size: 1024 },
          length: 1,
        },
      },
    });
    expect(container.querySelector("#submit")).toBeInTheDocument();
    mockedAxios.post.mockResolvedValueOnce({
      data: { error: true, message: "AnyError" },
    });
    fireEvent.click(container.querySelector("#submit"));
    await waitFor(() => getByText(/AnyError/));
  });
  // it("handle unknown error", async () => {
    //   // global.console = {
    //   //   warn: jest.fn(),
    //   //   log: jest.fn(),
    //   //   ...global.console
    //   // }
    //   // const spy = jest.spyOn(global.console, 'warn').mockImplementation()
    //   // const props = {};
    //   // const wrapper = mount(<Dropzone {...props} />);
    //   // expect(wrapper.find('#submit')).toHaveLength(0);
    //   // const input = wrapper.find('input.dropzone__fileinput');
    //   // expect(input).toHaveLength(1);
    //   // input.simulate('change', {
    //   //   target: {
    //   //     files: {
    //   //       0: { name: "test.xml", type: "text/xml", size: 1024 },
    //   //       length: 1
    //   //     },
    //   //   },
    //   // });
    //   // expect(wrapper.find('#submit')).toHaveLength(1);
    //   // mockedAxios.post.mockRejectedValueOnce("test");
    //   // wrapper.find('#submit').simulate('click');

  //   const { container } = render(<Dropzone />);
  //   expect(container.querySelector("#submit")).not.toBeInTheDocument();
  //   fireEvent.change(container.querySelector("input.dropzone__fileinput"), {
  //     target: {
  //       files: {
  //         0: { name: "test.xml", type: "text/xml", size: 1024 },
  //         length: 1,
  //       },
  //     },
  //   });
  //   expect(container.querySelector("#submit")).toBeInTheDocument();
  //   mockedAxios.post.mockRejectedValueOnce("test2");
  //   fireEvent.click(container.querySelector("#submit"));
  //   // expect(console.warn).toBeCalled();
  // });
});
