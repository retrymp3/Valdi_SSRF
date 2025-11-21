import { Component, StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { systemFont, systemBoldFont } from 'valdi_core/src/SystemFont';
import { Label, ScrollView, TextField, View } from 'valdi_tsx/src/NativeTemplateElements';
import { HTTPClient } from 'valdi_http/src/HTTPClient';
import { ElementRef } from 'valdi_core/src/ElementRef';

/**
 * @ViewModel
 * @ExportModel
 */
export interface ViewModel {}

/**
 * @Context
 * @ExportModel
 */
export interface ComponentContext {}

interface State {
  url: string;
  status: string;
  responseBody: string;
  responseStatusCode: number | null;
  loading: boolean;
}

/**
 * @Component
 * @ExportModel
 * 
 * URL Preview App
 * 
 * A simple utility to preview content from any URL.
 * Useful for checking links, viewing API responses, or previewing web content.
 */
export class App extends StatefulComponent<ViewModel, State, ComponentContext> {
  private urlInput = new ElementRef<TextField>();
  private scrollView = new ElementRef<ScrollView>();

  state: State = {
    url: '',
    status: 'Enter a URL to preview its content',
    responseBody: '',
    responseStatusCode: null,
    loading: false,
  };

  onCreate(): void {
    console.log('URL Preview App created');
  }

  onRender(): void {
    <view backgroundColor="white" width="100%" height="100%">
      <scroll ref={this.scrollView} padding={20} width="100%" height="100%">
        <view marginTop={40}>
          <label
            style={styles.title}
            value="URL Preview"
            font={systemBoldFont(28)}
          />
          <label
            style={styles.subtitle}
            value="Preview content from any URL"
            font={systemFont(16)}
            marginTop={8}
          />
        </view>

        <view marginTop={40}>
          <label style={styles.label} value="Enter URL:" font={systemFont(16)} />
          <textfield
            ref={this.urlInput}
            style={styles.textField}
            placeholder="https://example.com"
            value={this.state.url}
            onChange={this.onUrlChanged}
            onEditEnd={this.onUrlChanged}
            marginTop={8}
          />
        </view>

        <view marginTop={20} flexDirection="row" width="100%">
          <view
            style={styles.button}
            backgroundColor={!this.state.loading && this.state.url.length > 0 ? '#1976d2' : '#cccccc'}
            onTap={this.handleMakeRequest}
            padding={12}
            borderRadius={8}
            flexGrow={1}
            alignItems="center"
            justifyContent="center"
          >
            <label value="Preview" font={systemFont(16)} color="white" touchEnabled={false} />
          </view>
          <view
            style={styles.button}
            backgroundColor="#666"
            onTap={this.clearResults}
            marginLeft={10}
            padding={12}
            borderRadius={8}
            flexGrow={1}
            alignItems="center"
            justifyContent="center"
          >
            <label value="Clear" font={systemFont(16)} color="white" touchEnabled={false} />
          </view>
        </view>

        {this.state.loading && (
          <view marginTop={30}>
            <label
              style={styles.statusText}
              value={this.state.status}
              font={systemFont(14)}
              color="#666"
            />
          </view>
        )}

        {!this.state.loading && this.state.status !== 'Enter a URL to preview its content' && (
          <view marginTop={30}>
            <label style={styles.label} value="Status:" font={systemBoldFont(16)} />
            <label
              style={styles.statusText}
              value={this.state.status}
              font={systemFont(14)}
              marginTop={8}
            />
          </view>
        )}

        {this.state.responseStatusCode !== null && (
          <view marginTop={20}>
            <label
              style={styles.label}
              value={`HTTP Status: ${this.state.responseStatusCode}`}
              font={systemBoldFont(16)}
            />
          </view>
        )}

        {this.state.responseBody.length > 0 && (
          <view marginTop={20}>
            <label style={styles.label} value="Content:" font={systemBoldFont(16)} />
            <view
              style={styles.responseBox}
              backgroundColor="#f9f9f9"
              padding={12}
              marginTop={8}
              borderRadius={8}
            >
              <label
                style={styles.responseText}
                value={this.state.responseBody}
                font={systemFont(12)}
              />
            </view>
          </view>
        )}
      </scroll>
    </view>;
  }

  onUrlChanged: (event: { text: string }) => void = (event: { text: string }) => {
    this.setState({ url: event.text });
  };

  handleMakeRequest: () => void = () => {
    if (this.state.loading) {
      return;
    }
    
    // Get URL directly from input field
    const input = this.urlInput.single();
    const url = input ? (input.getAttribute('value')?.toString() ?? '').trim() : this.state.url.trim();
    
    if (!url) {
      this.setState({ status: 'Error: URL cannot be empty' });
      return;
    }
    
    this.makeRequest(url);
  };

  makeRequest: (url?: string) => void = async (url?: string) => {
    const requestUrl = url ?? this.state.url.trim();
    if (!requestUrl) {
      this.setState({ status: 'Error: URL cannot be empty' });
      return;
    }

    this.setState({
      loading: true,
      status: `Loading ${requestUrl}...`,
      responseBody: '',
      responseStatusCode: null,
    });

    try {
      const client = new HTTPClient();
      const response = await client.get(requestUrl);

      let bodyText = '';
      if (response.body) {
        try {
          bodyText = new TextDecoder().decode(response.body);
        } catch {
          bodyText = `[Binary data, ${response.body.length} bytes]`;
        }
      }

      this.setState({
        loading: false,
        status: 'Content loaded successfully',
        responseStatusCode: response.statusCode,
        responseBody: bodyText.length > 0 ? bodyText : '[No content]',
      });

      // Scroll to bottom to show response
      const scroll = this.scrollView.single();
      if (scroll) {
        // Note: ScrollView scrolling API may vary
      }
    } catch (error: any) {
      this.setState({
        loading: false,
        status: `Error: ${error?.toString() ?? 'Unknown error'}`,
        responseBody: '',
        responseStatusCode: null,
      });
    }
  };

  clearResults: () => void = () => {
    this.setState({
      status: 'Enter a URL to preview its content',
      responseBody: '',
      responseStatusCode: null,
      url: '',
    });
    const input = this.urlInput.single();
    if (input) {
      input.setAttribute('value', '');
    }
  };
}

const styles = {
  title: new Style<Label>({
    color: '#1976d2',
    width: '100%',
    textAlign: 'center',
  }),
  subtitle: new Style<Label>({
    color: '#666',
    width: '100%',
    textAlign: 'center',
  }),
  label: new Style<Label>({
    color: 'black',
    width: '100%',
  }),
  textField: new Style<TextField>({
    width: '100%',
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    font: systemFont(14),
    color: 'black',
  }),
  button: new Style<View>({
    minHeight: 44,
  }),
  statusText: new Style<Label>({
    color: '#333',
    width: '100%',
  }),
  responseBox: new Style<View>({
    width: '100%',
    minHeight: 100,
    maxHeight: 400,
  }),
  responseText: new Style<Label>({
    color: '#333',
    width: '100%',
  }),
};

