module {
  type MyActor = { maintenanceMode : Bool };

  public func run(old : MyActor) : MyActor {
    old;
  };
};
