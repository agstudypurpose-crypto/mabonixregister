from flask import Flask, request, jsonify
from flask_cors import CORS

import pywhatkit
import pyautogui
import time
from pynput.keyboard import Key, Controller

app = Flask(__name__)
CORS(app)

keyboard = Controller()


# ==========================================================
# SEND WHATSAPP MESSAGE
# ==========================================================
def send_whatsapp_automated(phone_no, message):

    print("\nSending to:", phone_no)
    print("Message:")
    print(message)

    pywhatkit.sendwhatmsg_instantly(
        phone_no=phone_no,
        message=message,
        wait_time=120,
        tab_close=True,
        close_time=3
    )

    # Wait for WhatsApp Web
    time.sleep(3)

    # Activate browser
    pyautogui.click()

    time.sleep(1)

    # Press Enter to send
    keyboard.press(Key.enter)
    keyboard.release(Key.enter)

    # Wait before next number
    time.sleep(5)


# ==========================================================
# RECEIVE STUDENT DATA FROM REACT
# ==========================================================
@app.route("/send-all-students", methods=["POST"])
def send_all_students():

    try:

        data = request.get_json()

        students = data.get("students", [])

        if not students:
            return jsonify({
                "success": False,
                "message": "No student data received"
            }), 400


        print("\n================================")
        print("DATA RECEIVED FROM REACT")
        print("================================")

        print("Total Students:", len(students))


        # ==================================================
        # SEND EACH STUDENT ONE BY ONE
        # ==================================================

        sent_count = 0
        failed_count = 0

        for index, student in enumerate(students):

            print("\n--------------------------------")
            print(
                f"Student {index + 1} / {len(students)}"
            )
            print("--------------------------------")

            # Get student data
            add_number = student.get(
                "addNumber",
                ""
            )

            name = student.get(
                "name",
                ""
            )

            mobile = student.get(
                "mobile",
                ""
            )

            attendance_status = student.get(
                "attendanceStatus",
                "Absent"
            )


            print("Add Number:", add_number)
            
            print("Name:", name)
            print("Mobile:", mobile)
            print(
                "Attendance:",
                attendance_status
            )


            # ==================================================
            # CHECK MOBILE NUMBER
            # ==================================================

            if not mobile:

                print(
                    "Mobile number missing. Skipping."
                )

                failed_count += 1

                continue


            # ==================================================
            # FORMAT PHONE NUMBER
            # ==================================================

            phone = mobile.strip()

            # Remove spaces, -, (, ), etc.
            phone = "".join(
                c for c in phone
                if c.isdigit() or c == "+"
            )

            # Add + if necessary
            if not phone.startswith("+"):
                phone = "+" + phone


            # ==================================================
            # CREATE WHATSAPP MESSAGE
            # ==================================================

            message = (
                f"Dear {name},\n\n"
                f"Attendance Update\n\n"
                f"Admission Number: {add_number}\n"
                f"Name: {name}\n"
                f"Attendance Status: "
                f"{attendance_status}\n\n"
                f"Thank you."
            )


            # ==================================================
            # SEND WHATSAPP
            # ==================================================

            try:

                send_whatsapp_automated(
                    phone,
                    message
                )

                print(
                    "Completed:",
                    phone
                )

                sent_count += 1


            except Exception as e:

                print(
                    "Error sending to",
                    phone
                )

                print(e)

                failed_count += 1


        # ==================================================
        # FINAL RESULT
        # ==================================================

        print("\n================================")
        print("ALL MESSAGES PROCESSED")
        print("================================")

        print(
            "Total:",
            len(students)
        )

        print(
            "Sent:",
            sent_count
        )

        print(
            "Failed:",
            failed_count
        )


        return jsonify({

            "success": True,

            "message":
                "All student messages processed",

            "total":
                len(students),

            "sent":
                sent_count,

            "failed":
                failed_count

        })


    except Exception as e:

        print("Server Error:", e)

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ==========================================================
# START SERVER
# ==========================================================

if __name__ == "__main__":

    print("\n================================")
    print("Student Attendance WhatsApp")
    print("================================")

    print(
        "Server running at:"
    )

    print(
        "http://127.0.0.1:5000"
    )

    print("================================\n")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )