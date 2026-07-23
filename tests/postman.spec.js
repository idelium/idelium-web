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
  method: "method",
  url: "url",
  assertions: "assertions",
  time: "time",
  response: "response",
  showResponse: "show response",
};

describe("Postman web integration", () => {
  it("normalizes CLI results and preserves assertion outcomes", () => {
    const [result] = parsePostmanResults(
      JSON.stringify([
        {
          status: 200,
          method: "get",
          url: "/users",
          passed: true,
          assertions: [{ passed: true }],
        },
      ]),
    );
    expect(result).toMatchObject({ status: 200, method: "GET", passed: true });
    expect(statusVariant(result)).toBe("success");
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
      { status: 500, method: "post", response: { error: true } },
    ]);
    const wrapper = mount(PostmanResultTable, { props: { results, labels } });
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("show-response")[0][0]).toEqual(results[0]);
    expect(formatPostmanResponse(results[0].response)).toContain(
      '"error": true',
    );
  });
});
