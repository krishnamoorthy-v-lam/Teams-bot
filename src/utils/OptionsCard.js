module.exports.OptionsCard = {
  initalCard: {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        text: "Hi there!",
        weight: "Bolder",
        size: "Medium",
      },
      {
        type: "TextBlock",
        text: "Choose an option:",
        wrap: true,
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Create Ticket",
        data: {
          action: "create_ticket",
        },
      },
      {
        type: "Action.Submit",
        title: "View Tickets",
        data: {
          action: "view_tickets",
        },
      },
    ],
  },
};
