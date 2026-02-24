import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile type as required by frontend
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Content models
  public type Likes = {
    count : Nat;
    likedBy : [Text];
  };

  public type Poetry = {
    id : Text;
    title : Text;
    content : Text;
    category : Text;
    image : ?Storage.ExternalBlob;
    likes : Likes;
  };

  public type Dua = {
    id : Text;
    title : Text;
    content : Text;
    category : Text;
    audio : ?Storage.ExternalBlob;
    likes : Likes;
  };

  public type Song = {
    id : Text;
    title : Text;
    artist : Text;
    category : Text;
    audio : ?Storage.ExternalBlob;
  };

  public type CreatePoetryInput = {
    title : Text;
    content : Text;
    image : ?Storage.ExternalBlob;
  };

  public type CreateDuaInput = {
    title : Text;
    content : Text;
    audio : ?Storage.ExternalBlob;
  };

  public type CreateSongInput = {
    title : Text;
    artist : Text;
    audio : Storage.ExternalBlob;
  };

  public type LikeInput = {
    userId : Text;
    contentId : Text;
    contentType : Text;
  };

  // Maps for content storage
  let poetryMap = Map.empty<Text, Poetry>();
  let duaMap = Map.empty<Text, Dua>();
  let songMap = Map.empty<Text, Song>();

  // Counter for generating IDs
  var poetryCounter : Nat = 0;
  var duaCounter : Nat = 0;
  var songCounter : Nat = 0;

  // Validation helpers
  func isEmpty(val : Text) : Bool {
    val.trim(#char ' ').size() == 0;
  };

  func isValidAudio(_ : Storage.ExternalBlob) : Bool {
    true;
  };

  func isValidImage(_ : Storage.ExternalBlob) : Bool {
    true;
  };

  // Generate random like count between 1000-2000
  func generateRandomLikes() : Nat {
    1000 + (Int.abs(Time.now()) % 1001);
  };

  // PUBLIC: Create Poetry
  public shared ({ caller }) func createPoetry(input : CreatePoetryInput) : async Text {
    if (isEmpty(input.title) or isEmpty(input.content)) {
      Runtime.trap("Title and content must not be empty");
    };

    switch (input.image) {
      case (?img) {
        if (not isValidImage(img)) {
          Runtime.trap("Invalid image file type");
        };
      };
      case (null) {};
    };

    poetryCounter += 1;
    let id = "poetry_" # poetryCounter.toText();
    let newPoetry : Poetry = {
      id;
      title = input.title;
      content = input.content;
      image = input.image;
      category = "poetry";
      likes = { count = generateRandomLikes(); likedBy = [] };
    };

    poetryMap.add(id, newPoetry);
    id;
  };

  // PUBLIC: Create Dua
  public shared ({ caller }) func createDua(input : CreateDuaInput) : async Text {
    if (isEmpty(input.title) or isEmpty(input.content)) {
      Runtime.trap("Title and content must not be empty");
    };

    switch (input.audio) {
      case (?aud) {
        if (not isValidAudio(aud)) {
          Runtime.trap("Invalid audio file type");
        };
      };
      case (null) {};
    };

    duaCounter += 1;
    let id = "dua_" # duaCounter.toText();
    let newDua : Dua = {
      id;
      title = input.title;
      content = input.content;
      audio = input.audio;
      category = "dua";
      likes = { count = generateRandomLikes(); likedBy = [] };
    };

    duaMap.add(id, newDua);
    id;
  };

  // PUBLIC: Create Song
  public shared ({ caller }) func createSong(input : CreateSongInput) : async Text {
    if (isEmpty(input.title) or isEmpty(input.artist)) {
      Runtime.trap("Title and artist must not be empty");
    };

    if (not isValidAudio(input.audio)) {
      Runtime.trap("Invalid audio file type");
    };

    songCounter += 1;
    let id = "song_" # songCounter.toText();
    let newSong : Song = {
      id;
      title = input.title;
      artist = input.artist;
      audio = ?input.audio;
      category = "song";
    };

    songMap.add(id, newSong);
    id;
  };

  // Admin-only: Delete Poetry
  public shared ({ caller }) func deletePoetry(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete poetry");
    };

    switch (poetryMap.get(id)) {
      case (?_) {
        poetryMap.remove(id);
        true;
      };
      case (null) { false };
    };
  };

  // Admin-only: Delete Dua
  public shared ({ caller }) func deleteDua(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete duas");
    };

    switch (duaMap.get(id)) {
      case (?_) {
        duaMap.remove(id);
        true;
      };
      case (null) { false };
    };
  };

  // Admin-only: Delete Song
  public shared ({ caller }) func deleteSong(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete songs");
    };

    switch (songMap.get(id)) {
      case (?_) {
        songMap.remove(id);
        true;
      };
      case (null) { false };
    };
  };

  // Public: Get Poetry by ID
  public query func getPoetryById(id : Text) : async ?Poetry {
    poetryMap.get(id);
  };

  // Public: Get Dua by ID
  public query func getDuaById(id : Text) : async ?Dua {
    duaMap.get(id);
  };

  // Public: Get Song by ID
  public query func getSongById(id : Text) : async ?Song {
    songMap.get(id);
  };

  // Public: Get all Poetry
  public query func getAllPoetry() : async [Poetry] {
    poetryMap.values().toArray();
  };

  // Public: Get all Duas
  public query func getAllDuas() : async [Dua] {
    duaMap.values().toArray();
  };

  // Public: Get all Songs
  public query func getAllSongs() : async [Song] {
    songMap.values().toArray();
  };

  // Public: Like Poetry (anyone can like, uses caller identity)
  public shared ({ caller }) func likePoetry(id : Text, userId : Text) : async Bool {
    // Verify that the userId matches the caller to prevent impersonation
    let callerText = caller.toText();
    if (callerText != userId) {
      Runtime.trap("Unauthorized: Cannot like on behalf of another user");
    };

    if (isEmpty(userId)) {
      Runtime.trap("User ID must not be empty");
    };

    switch (poetryMap.get(id)) {
      case (?poetry) {
        let alreadyLiked = poetry.likes.likedBy.find(func(u) { u == userId });
        switch (alreadyLiked) {
          case (?_) { false };
          case (null) {
            let newLikedBy = poetry.likes.likedBy.concat([userId]);
            let updatedPoetry : Poetry = {
              poetry with likes = {
                count = poetry.likes.count + 1;
                likedBy = newLikedBy;
              };
            };
            poetryMap.add(id, updatedPoetry);
            true;
          };
        };
      };
      case (null) { Runtime.trap("Poetry not found") };
    };
  };

  // Public: Like Dua (anyone can like, uses caller identity)
  public shared ({ caller }) func likeDua(id : Text, userId : Text) : async Bool {
    // Verify that the userId matches the caller to prevent impersonation
    let callerText = caller.toText();
    if (callerText != userId) {
      Runtime.trap("Unauthorized: Cannot like on behalf of another user");
    };

    if (isEmpty(userId)) {
      Runtime.trap("User ID must not be empty");
    };

    switch (duaMap.get(id)) {
      case (?dua) {
        let alreadyLiked = dua.likes.likedBy.find(func(u) { u == userId });
        switch (alreadyLiked) {
          case (?_) { false };
          case (null) {
            let newLikedBy = dua.likes.likedBy.concat([userId]);
            let updatedDua : Dua = {
              dua with likes = {
                count = dua.likes.count + 1;
                likedBy = newLikedBy;
              };
            };
            duaMap.add(id, updatedDua);
            true;
          };
        };
      };
      case (null) { Runtime.trap("Dua not found") };
    };
  };

  // Public: Get Poetry likes
  public query func getPoetryLikes(id : Text) : async ?Likes {
    switch (poetryMap.get(id)) {
      case (?poetry) { ?poetry.likes };
      case (null) { null };
    };
  };

  // Public: Get Dua likes
  public query func getDuaLikes(id : Text) : async ?Likes {
    switch (duaMap.get(id)) {
      case (?dua) { ?dua.likes };
      case (null) { null };
    };
  };
};
