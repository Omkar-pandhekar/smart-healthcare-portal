"use client";
import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Mail,
  MessageSquare,
  User,
  Phone,
  MapPin,
  Send,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import Swal from "sweetalert2";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const formRef = useRef(null);
  const isInView = useInView(formRef, { once: false, amount: 0.3 });

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      content: "support@socialshelf.com",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone",
      content: "+1 (555) 123-4567",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Address",
      content: "123 Bookshelf Lane, Reading, CA 90210",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Hours",
      content: "Mon-Fri: 9AM - 6PM EST",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/contact/add-contact", {
        name,
        email,
        phone,
        message,
      });

      if (response.data.success) {
        setFormSubmitted(true);
        Swal.fire({
          position: "bottom-end",
          icon: "success",
          title: "Message sent successfully!",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          customClass: {
            popup: "border border-border shadow-lg",
          },
        });

        // Reset form after 3 seconds
        setTimeout(() => {
          setFormSubmitted(false);
          setName("");
          setEmail("");
          setPhone("");
          setMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        position: "bottom-end",
        icon: "error",
        title: "Failed to send message. Please try again.",
        toast: true,
        showConfirmButton: false,
        timer: 3000,
        background: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        customClass: {
          popup: "border border-border shadow-lg",
        },
      });
    }
  };

  const formAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const successAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 200,
      },
    },
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Have questions about Social Shelf? Want to partner with us? Drop us
            a message, and we&apos;ll get back to you soon.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info Column */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="bg-neutral-100 dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-zinc-950">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <div className="bg-blue-50 dark:bg-zinc-700 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  {["Twitter", "Facebook", "Instagram", "LinkedIn"].map(
                    (platform, index) => (
                      <motion.a
                        key={platform}
                        href={`#${platform.toLowerCase()}`}
                        className="bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 p-3 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <span className="sr-only">{platform}</span>
                        {/* Simple icon placeholders */}
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d={
                              platform === "Twitter"
                                ? "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                                : platform === "Facebook"
                                ? "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                                : platform === "Instagram"
                                ? "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"
                                : "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                            }
                          />
                        </svg>
                      </motion.a>
                    )
                  )}
                </div>
              </div>
            </div>

            <motion.div
              className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-4">
                Subscribe to Our Newsletter
              </h3>
              <p className="mb-4 text-blue-100">
                Get the latest news and updates from Social Shelf
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/20 border-0 text-white placeholder:text-blue-100"
                />
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                  Subscribe
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form Column */}
          <div className="lg:col-span-3">
            <motion.div
              ref={formRef}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-zinc-950 relative overflow-hidden"
              variants={formAnimation}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {formSubmitted ? (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800 z-10"
                  variants={successAnimation}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full p-4 mb-4">
                    <svg
                      className="h-12 w-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    Thank you for reaching out. We&apos;ve received your message
                    and will get back to you shortly.
                  </p>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Send Us a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={itemAnimation}>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5"
                          placeholder="John Doe"
                        />
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemAnimation}>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5"
                            placeholder="john@example.com"
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={itemAnimation}>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </motion.div>
                    </div>

                    <motion.div variants={itemAnimation}>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Message <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                          <MessageSquare className="h-5 w-5 text-gray-400" />
                        </div>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5"
                          placeholder="How can we help you?"
                          rows={5}
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemAnimation}>
                      <Button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg flex items-center justify-center"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </Button>
                    </motion.div>
                  </form>
                </>
              )}

              {/* Decorative Elements */}
              <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-20 z-0"></div>
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-20 z-0"></div>
            </motion.div>
          </div>
        </div>

        {/* Map Section */}
        <motion.div
          className="mt-16 rounded-2xl overflow-hidden shadow-xl h-96 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700">
            {/* Placeholder for a real map integration */}
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center">
              <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Visit Our Office
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    123 Bookshelf Lane, Reading, CA 90210
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
