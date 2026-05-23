package com.example.regapdf

import android.annotation.SuppressLint
import android.app.Activity
import android.app.DownloadManager
import android.content.Context
import android.content.BroadcastReceiver
import android.content.IntentFilter
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.webkit.CookieManager
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import android.widget.FrameLayout
import android.widget.ImageView
import android.view.Gravity
import android.view.View
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.activity.addCallback
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts

class MainActivity : ComponentActivity() {
    private val onDownloadComplete = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
            val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            val query = DownloadManager.Query().setFilterById(id)
            val cursor = dm.query(query)
            if (cursor.moveToFirst()) {
                val statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
                val uriIndex = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI)
                val mimeIndex = cursor.getColumnIndex(DownloadManager.COLUMN_MEDIA_TYPE)
                
                if (statusIndex != -1 && cursor.getInt(statusIndex) == DownloadManager.STATUS_SUCCESSFUL) {
                    val uriString = cursor.getString(uriIndex)
                    val mimeType = cursor.getString(mimeIndex)
                    if (uriString != null) {
                        val openFolderIntent = Intent(DownloadManager.ACTION_VIEW_DOWNLOADS)
                        openFolderIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        try {
                            context.startActivity(openFolderIntent)
                            Toast.makeText(context, "File downloaded successfully!", Toast.LENGTH_SHORT).show()
                        } catch (e: Exception) {
                            Toast.makeText(context, "Downloaded! Check your Downloads folder.", Toast.LENGTH_LONG).show()
                        }
                    }
                }
            }
            cursor.close()
        }
    }

        inner class WebAppInterface {
        @JavascriptInterface
        fun closeApp() {
            runOnUiThread {
                this@MainActivity.finishAffinity()
                System.exit(0)
            }
        }

        @JavascriptInterface
        fun downloadFile(url: String, filename: String) {
            val request = DownloadManager.Request(Uri.parse(url))
            val cookies = CookieManager.getInstance().getCookie(url)
            request.addRequestHeader("cookie", cookies)
            request.setTitle(filename)
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
            val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)
            runOnUiThread {
                Toast.makeText(applicationContext, "Downloading...", Toast.LENGTH_SHORT).show()
            }
        }
    }


    private lateinit var webView: WebView
    private lateinit var loadingLogo: View
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (fileUploadCallback == null) return@registerForActivityResult
        var results: Array<Uri>? = null
        if (result.resultCode == Activity.RESULT_OK) {
            val intent = result.data
            if (intent != null) {
                if (intent.clipData != null) {
                    val count = intent.clipData!!.itemCount
                    results = Array(count) { i -> intent.clipData!!.getItemAt(i).uri }
                } else if (intent.data != null) {
                    results = arrayOf(intent.data!!)
                }
            }
        }
        fileUploadCallback?.onReceiveValue(results)
        fileUploadCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
                super.onCreate(savedInstanceState)
        
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        onBackPressedDispatcher.addCallback(this) {
            if (webView.canGoBack()) {
                webView.goBack()
            } else {
                finish()
            }
        }

        val rootLayout = FrameLayout(this)
        webView = WebView(this)
        rootLayout.addView(webView, FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)

        // Centered loading logo
        loadingLogo = ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher) // Using app icon as logo
            layoutParams = FrameLayout.LayoutParams(200, 200).apply {
                gravity = Gravity.CENTER
            }
        }
        rootLayout.addView(loadingLogo)

        setContentView(rootLayout)

        webView.setBackgroundColor(android.graphics.Color.BLACK)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(onDownloadComplete, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_EXPORTED)
        } else {
            registerReceiver(onDownloadComplete, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE))
        }


        val webSettings: WebSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.allowFileAccess = true

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                loadingLogo.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                loadingLogo.visibility = View.GONE
                // Center logo elements in the web content
                val js = """
                    (function() {
                        var style = document.createElement('style');
                        style.innerHTML = `
                            img[alt*='REGA'], .logo, #logo { 
                                display: block !important; 
                                margin-left: auto !important; 
                                margin-right: auto !important; 
                                text-align: center !important; 
                            }
                        `;
                        document.head.appendChild(style);
                    })();
                """.trimIndent()
                view?.evaluateJavascript(js, null)
            }
        }
        webView.addJavascriptInterface(WebAppInterface(), "Android")
        
        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback
                
                val contentIntent = Intent(Intent.ACTION_GET_CONTENT)
                contentIntent.addCategory(Intent.CATEGORY_OPENABLE)
                
                val acceptTypes = fileChooserParams?.acceptTypes
                var mimeType = "*/*"
                if (!acceptTypes.isNullOrEmpty()) {
                    val htmlType = acceptTypes[0].lowercase()
                    mimeType = when {
                        htmlType.contains("pdf") -> "application/pdf"
                        htmlType.contains("image") -> "image/*"
                        else -> "*/*"
                    }
                }
                contentIntent.type = mimeType
                
                if (fileChooserParams?.mode == FileChooserParams.MODE_OPEN_MULTIPLE) {
                    contentIntent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                }
                fileChooserLauncher.launch(contentIntent)
                return true
            }
        }

        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, contentLength ->
            val request = DownloadManager.Request(Uri.parse(url))
            request.setMimeType(mimetype)
            val cookies = CookieManager.getInstance().getCookie(url)
            request.addRequestHeader("cookie", cookies)
            request.addRequestHeader("User-Agent", userAgent)
            request.setDescription("Downloading file...")
            request.setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype))
            request.allowScanningByMediaScanner()
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            request.setDestinationInExternalPublicDir(
                Environment.DIRECTORY_DOWNLOADS,
                URLUtil.guessFileName(url, contentDisposition, mimetype)
            )
            val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)
            Toast.makeText(applicationContext, "Downloading File", Toast.LENGTH_LONG).show()
        }

        webView.loadUrl("https://ragnokk-rega-pdf-general-store.hf.space")
    }

    // Removed deprecated onBackPressed override in favor of onBackPressedDispatcher callback
}
