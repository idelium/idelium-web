export function pluginApprovalView(plugin, labels = {}) {
  const status = String(plugin?.approvalStatus ?? "unknown").toLowerCase();
  const reviewed = Boolean(plugin?.provenanceReviewed);
  const hash = String(plugin?.sourceSha256 ?? "");
  const executionMode = String(plugin?.executionMode ?? "unknown");

  if (
    status === "approved" &&
    reviewed &&
    hash !== "" &&
    executionMode === "subprocess"
  ) {
    return {
      status: "approved",
      variant: "success",
      label: labels.approved ?? "Approved",
      title:
        labels.approvedTitle ?? "Approved plugin with verified provenance.",
    };
  }

  if (status === "unapproved") {
    return {
      status: "unapproved",
      variant: "warning",
      label: labels.unapproved ?? "Unapproved",
      title:
        labels.unapprovedTitle ??
        "Plugin is saved but cannot execute until approval and integrity checks pass.",
    };
  }

  return {
    status: "invalid",
    variant: "danger",
    label: labels.invalid ?? "Invalid",
    title:
      labels.invalidTitle ??
      "Plugin approval metadata is incomplete or inconsistent.",
  };
}

export function shortPluginHash(plugin) {
  const hash = String(plugin?.sourceSha256 ?? "");
  return hash.length >= 12 ? hash.slice(0, 12) : hash;
}
