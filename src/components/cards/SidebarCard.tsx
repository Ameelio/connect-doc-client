import React from "react";
import { CardType } from "src/utils/constants";
import { Spinner } from "react-bootstrap";
import ConnectionCard from "./ConnectionCard";

interface Props {
  type: CardType;
  entity: LiveVisitation | ConnectionRequest;
  handleClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  isActive: boolean;
}

const SidebarCard: React.FC<Props> = ({
  type,
  entity,
  handleClick,
  isActive,
}) => {
  const activeBorder = isActive ? "left-sidebar-card-active" : "";
  const fontColor = isActive ? "primary" : "black-500";

  const genCard = (): JSX.Element => {
    switch (type) {
      case CardType.LiveVisitation:
        const { connection, id } = entity as LiveVisitation;
        const { inmate, contact } = connection;
        return inmate && contact ? (
          <ConnectionCard
            inmate={inmate}
            contact={contact}
            kioskId={id}
            fontColor={fontColor}
            actionLabel="Calling"
          />
        ) : (
          <Spinner animation="border" />
        );
      case CardType.ConnectionRequest:
        const connectionRequest = entity as ConnectionRequest;
        return connectionRequest.inmate && connectionRequest.contact ? (
          <ConnectionCard
            inmate={connectionRequest.inmate}
            contact={connectionRequest.contact}
            fontColor={fontColor}
            actionLabel="Requests"
          />
        ) : (
          <Spinner animation="border" />
        );

      default:
        return <div></div>;
    }
  };
  return (
    <div
      className={`pr-3 py-4 left-sidebar-card border-bottom ${activeBorder}`}
      onClick={handleClick}
    >
      {genCard()}
    </div>
  );
};

export default SidebarCard;
