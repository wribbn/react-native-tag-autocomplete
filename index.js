import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";
import Autocomplete from "react-native-autocomplete-input";

export default class AutoTags extends Component {
  state = {
    query: "",
    eventCount: 0,
  };

  renderTags = () => {
    if (this.props.renderTags) {
      return this.props.renderTags(this.props.tagsSelected);
    }

    const tagMargins = this.props.tagsOrientedBelow
      ? { marginBottom: 5 }
      : { marginTop: 5 };

    return (
      <View style={this.props.tagStyles || styles.tags}>
        {this.props.tagsSelected.map((t, i) => {
          return (
            <TouchableHighlight
              key={i}
              style={[tagMargins, styles.tag]}
              onPress={() => this.props.handleDelete(i)}
            >
              <Text>{t.name}</Text>
            </TouchableHighlight>
          );
        })}
      </View>
    );
  };

  handleInput = text => {
    if (this.submitting) return;
    if (this.props.allowBackspace) {
      //TODO: on ios, delete last tag on backspace event && empty query
      //(impossible on android atm, no listeners for empty backspace)
    }
    if (this.props.onChangeText) return this.props.onChangeText(text);
    if (
      this.props.createTagOnSpace &&
      this.props.onCustomTagCreated &&
      text.length > 1 &&
      text.charAt(text.length - 1) === " "
    ) {
      this.setState({ query: "" });
      return this.props.onCustomTagCreated(text.trim());
    } else if (this.props.createTagOnSpace && !this.props.onCustomTagCreated) {
      console.error(
        "When enabling createTagOnSpace, you must provide an onCustomTagCreated function"
      );
    }

    if (text.charAt(text.length - 1) === "\n") {
      return; // prevent onSubmit bugs
    }

    this.setState({ query: text });
  };

  filterData = query => {
    if (!query || query.trim() == "" || !this.props.suggestions) {
      return;
    }
    if (this.props.filterData) {
      return this.props.filterData(query);
    }
    let suggestions = this.props.suggestions;
    let results = [];
    query = query.toUpperCase();
    suggestions.forEach(i => {
      if (i.name.toUpperCase().includes(query)) {
        results.push(i);
      }
    });
    return results;
  };

  onSubmitEditing = () => {
    const { query } = this.state;
    if (!this.props.onCustomTagCreated || query.trim() === "") return;
    this.setState({ query: "" }, () => this.props.onCustomTagCreated(query));

    // prevents an issue where handleInput() will overwrite
    // the query clear in some circumstances
    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
    }, 30);
  };

  addTag = tag => {
    this.props.handleAddition(tag);
    this.setState({ query: "" });
  };

  render() {
    const { query } = this.state;
    const data = this.filterData(query);

    return (
      <View style={styles.AutoTags}>
        {!this.props.tagsOrientedBelow &&
          this.props.tagsSelected &&
          this.renderTags()}
        <Autocomplete
          data={data}
          controlled={true}
          placeholder={this.props.placeholder}
          defaultValue={query}
          value={query}
          onChangeText={text => this.handleInput(text)}
          // Use backspace to delete tags. For some reason react-native fires an
          // _extra_ backspace keypress event the first time a (new) key is
          // pressed after the original backspace,  so this code sets a short
          // delay to ignore that erroneous event and only remove tags on the
          // original one.
          onKeyPress={(e) =>  {
            if ((e.nativeEvent.eventCount !== this.state.eventCount) && e.nativeEvent.key === 'Backspace' && !query) {
              // Return if duration between previous key press and backspace is less than 20ms
              if (Math.abs(this.lastKeyEventTimestamp - e.timeStamp) < 20) return;
              this.props.handleDelete(this.props.tagsSelected.length - 1)

              // Cache the event count in state so that we don't get accidental
              // deletions on input blur, plus 1 for the backspace key
              this.setState({ eventCount: e.nativeEvent.eventCount + 1 })
            } else {
              // Record non-backspace key event time stamp
              this.lastKeyEventTimestamp = e.timeStamp;

              // Cache the event count in state so that we don't get accidental
              // deletions on input blur
              this.setState({ eventCount: e.nativeEvent.eventCount })
            }
          }}
          onSubmitEditing={this.onSubmitEditing}
          multiline={true}
          autoFocus={this.props.autoFocus === false ? false : true}
          renderItem={suggestion => (
            <TouchableOpacity onPress={e => this.addTag(suggestion)}>
              {this.props.renderSuggestion ? (
                this.props.renderSuggestion(suggestion)
              ) : (
                <Text>{suggestion.name}</Text>
              )}
            </TouchableOpacity>
          )}
          inputContainerStyle={
            this.props.inputContainerStyle || styles.inputContainerStyle
          }
          containerStyle={this.props.containerStyle || styles.containerStyle}
          underlineColorAndroid="transparent"
          style={{ backgroundColor: "#efeaea" }}
          listContainerStyle={{
            backgroundColor: this.props.tagsOrientedBelow
              ? "#efeaea"
              : "transparent"
          }}
          {...this.props}
        />
        {this.props.tagsOrientedBelow &&
          this.props.tagsSelected &&
          this.renderTags()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  AutoTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start"
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    backgroundColor: "#efeaea",
    width: 300
  },
  tag: {
    backgroundColor: "rgb(244, 244, 244)",
    justifyContent: "center",
    alignItems: "center",
    height: 30,
    marginLeft: 5,
    borderRadius: 30,
    padding: 8
  },
  inputContainerStyle: {
    borderRadius: 0,
    paddingLeft: 5,
    height: 40,
    width: 300,
    justifyContent: "center",
    borderColor: "transparent",
    alignItems: "stretch",
    backgroundColor: "#efeaea"
  },
  containerStyle: {
    minWidth: 200,
    maxWidth: 300
  }
});
