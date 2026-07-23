import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import PostmanResultTable from "@/view/testperformed/PostmanResultTable.vue";
import {
  classifyPostmanDocument,
  formatPostmanResponse,
  parsePostmanResults,
  statusVariant,
} from "@/domain/postmanResults";

const labels = {
  id: "#",
  status: "status",
  request: "request",
  method: "method",
  url: "url",
  assertions: "assertions",
  diagnostic: "diagnostic",
  time: "time",
  response: "response",
  showResponse: "show response",
};

describe("Postman web integration", () => {
  it("normalizes CLI results and preserves assertion outcomes", () => {
    const [result] = parsePostmanResults(
      JSON.stringify([
        {
          name: "GET Request",
          status: 200,
          method: "get",
          url: { raw: "https://example.test/users" },
          passed: true,
          assertions: [{ passed: true }],
        },
      ]),
    );
    expect(result).toMatchObject({
      name: "GET Request",
      status: 200,
      method: "GET",
      url: "https://example.test/users",
      passed: true,
    });
    expect(statusVariant(result)).toBe("success");
  });

  it("surfaces failed Newman diagnostics directly in the result table", () => {
    const [result] = parsePostmanResults([
      {
        name: "Newman",
        status: 0,
        method: "NEWMAN",
        passed: false,
        assertions: [
          {
            name: "newman",
            passed: false,
            message:
              "Newman is required to run this Postman collection but was not found on PATH. Install it with `npm install -g newman`.",
          },
        ],
      },
    ]);

    const wrapper = mount(PostmanResultTable, {
      props: { results: [result], labels },
    });

    expect(result.diagnostic).toContain("npm install -g newman");
    expect(wrapper.text()).toContain("Newman is required");
    expect(wrapper.text()).toContain("npm install -g newman");
  });

  it("normalizes single result objects and invalid payloads safely", () => {
    expect(parsePostmanResults({ status: 200, method: "get" })).toHaveLength(1);
    expect(parsePostmanResults("{not-json")).toEqual([]);
  });

  it("distinguishes collections and environments", () => {
    expect(
      classifyPostmanDocument({ info: { name: "API" }, item: [] }).type,
    ).toBe("collection");
    expect(classifyPostmanDocument({ name: "Local", values: [] }).type).toBe(
      "environment",
    );
  });

  it("renders results and emits the selected response", async () => {
    const results = parsePostmanResults([
      {
        name: "Create user",
        status: 500,
        method: "post",
        url: {
          protocol: "https",
          host: ["example", "test"],
          path: ["users"],
          query: [{ key: "page", value: "1" }],
        },
        response: { error: true },
      },
    ]);
    const wrapper = mount(PostmanResultTable, { props: { results, labels } });
    expect(wrapper.text()).toContain("Create user");
    expect(wrapper.text()).toContain("https://example.test/users?page=1");
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("show-response")[0][0]).toEqual(results[0]);
    expect(formatPostmanResponse(results[0].response)).toContain(
      '"error": true',
    );
  });
});
