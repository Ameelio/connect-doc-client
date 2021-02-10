import React, { useEffect, useState } from "react";
import "./App.scss";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Login from "./pages/Login";
import { RootState } from "src/redux";
import { connect, ConnectedProps, useSelector } from "react-redux";
import ProtectedRoute, {
  ProtectedRouteProps,
} from "./components/hocs/ProtectedRoute";
import { loginWithToken } from "./api/User";
import Menu from "./components/headers/Menu";
import { Avatar, Layout, PageHeader, Menu as AntdMenu } from "antd";
import { logout } from "src/redux/modules/user";
import { Footer } from "antd/lib/layout/layout";
import { fetchFacilities } from "./redux/modules/facility";
import { selectAllFacilities } from "./redux/selectors";
import { selectActiveFacility } from "src/redux/modules/facility";
import { ROUTES } from "./utils/constants";
import { ConnectedRouter } from "connected-react-router";
import { History } from "history";
import { fetchContacts } from "./redux/modules/contact";
import { fetchStaff } from "./redux/modules/staff";
import { fetchInmates } from "./redux/modules/inmate";
import { fetchConnections } from "./redux/modules/connections";
import { fetchNodes } from "./redux/modules/node";
import { fetchKiosks } from "./redux/modules/kiosk";
import { fetchCalls } from "./redux/modules/call";
import { startOfMonth } from "date-fns/esm";
import { endOfMonth } from "date-fns";

const mapStateToProps = (state: RootState) => ({
  session: state.session,
  selected: state.facilities.selected,
  pathname: state.router.location,
});
const mapDispatchToProps = {
  logout,
  fetchFacilities,
  selectActiveFacility,
  fetchContacts,
  fetchStaff,
  fetchInmates,
  fetchConnections,
  fetchNodes,
  fetchKiosks,
  fetchCalls,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const { Header } = Layout;

function App({
  session,
  selected,
  pathname,
  selectActiveFacility,
  logout,
  fetchFacilities,
  fetchContacts,
  fetchInmates,
  fetchStaff,
  fetchConnections,
  fetchNodes,
  fetchKiosks,
  fetchCalls,
  history,
}: PropsFromRedux & { history: History }) {
  const defaultProtectedRouteProps: ProtectedRouteProps = {
    isAuthenticated: session.authInfo.apiToken !== "", // TODO: improve this later
    authenticationPath: "/login",
  };

  const facilities = useSelector(selectAllFacilities);
  // const history = useHistory();
  const [header, setHeader] = useState("");

  useEffect(() => {
    // localStorage.setItem("debug", "*");
    localStorage.removeItem("debug");
    (async () => {
      try {
        await loginWithToken();
        await fetchFacilities();
      } catch (err) {}
    })();
  }, [fetchFacilities]);

  useEffect(() => {
    if (session.isLoggedIn) fetchFacilities();
  }, [session.isLoggedIn]);

  useEffect(() => {
    if (selected) {
      (async () => {
        await Promise.allSettled([
          fetchContacts(),
          fetchStaff(),
          fetchInmates(),
          fetchConnections(),
          fetchNodes(),
          fetchKiosks(),
        ]);
        fetchCalls({
          startDate: startOfMonth(new Date()).getTime(),
          endDate: endOfMonth(new Date()).getTime(),
        });
      })();
    }
  }, [selected, fetchContacts, fetchStaff, fetchConnections, fetchInmates]);

  useEffect(() => {
    const route = ROUTES.find((route) => route.path === pathname.pathname);
    if (route) setHeader(route.label);
  }, [pathname]);

  return (
    <ConnectedRouter history={history}>
      <Layout style={{ minHeight: "100vh" }}>
        {selected && (
          <Menu
            session={session}
            logout={logout}
            selected={selected}
            facilities={facilities}
            select={(facility) => selectActiveFacility(facility)}
          />
        )}
        <Layout>
          <PageHeader
            title={header}
            // extra={[
            //   <BellFilled key="bell" />,
            //   <BulbFilled key="bulb" />,
            //   <InitialsAvatar
            //     name={genFullName(session.user)}
            //     size="default"
            //     shape="circle"
            //     key="avatar"
            //   />,
            // ]}
          />
          <Switch>
            <Route exact path="/login" component={Login}></Route>
            {ROUTES.map((route) => (
              <ProtectedRoute
                exact
                {...defaultProtectedRouteProps}
                path={route.path}
                component={route.component}
                key={route.label}
              ></ProtectedRoute>
            ))}
          </Switch>
          <Footer style={{ textAlign: "center" }}>
            Connect ©2021 Created by Ameelio Inc.
          </Footer>
        </Layout>
      </Layout>
    </ConnectedRouter>
  );
}

export default connector(App);
